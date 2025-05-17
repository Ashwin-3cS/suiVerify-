module whitelist::attestation {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::table::{Self, Table};
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};
    use sui::vec_set::{Self, VecSet};

    // ======== Errors ========
    const EUserNotWhitelisted: u64 = 0;
    const EInvalidWhitelister: u64 = 1;
    const EUserAlreadyAttested: u64 = 2;
    const EInvalidTimestamp: u64 = 3;
    const ENotAuthorized: u64 = 4;
    const ENotOwner: u64 = 5;

    // ======== Role Types ========
    const ROLE_WHITELISTER: u8 = 0;
    const ROLE_ENCRYPTER: u8 = 1;
    const ROLE_BLOB_UPLOADER: u8 = 2;
    const ROLE_DID_CREATOR: u8 = 3;

    // ======== Objects ========
    public struct AttestationCap has key {
        id: UID,
        owner: address,
        // Authorized members for each role
        whitelisters: VecSet<address>,
        encrypters: VecSet<address>,
        blob_uploaders: VecSet<address>,
        did_creators: VecSet<address>
    }

    public struct AttestationRegistry has key {
        id: UID,
        whitelisted_users: Table<address, WhitelistInfo>,
        attested_users: Table<address, bool>,
        encryption_details: Table<address, EncryptionDetails>,
        blob_upload_details: Table<address, BlobUploadDetails>,
        did_creation_details: Table<address, DIDCreationDetails>,
    }

    // ======== public structs for storing attestation data ========
    public struct WhitelistInfo has store, copy, drop {
        tx_digest: vector<u8>,
        whitelister_address: address,
        timestamp: u64,
    }

    public struct EncryptionDetails has store, copy, drop {
        encryption_id: String,
        policy_object_id: String,
        package_id: String,
        timestamp: u64,
    }

    public struct BlobUploadDetails has store, copy, drop {
        uploader_address: address,
        data_owner_address: address,
        timestamp: u64,
    }

    public struct DIDCreationDetails has store, copy, drop {
        did_owner: address,
        digest: vector<u8>,
        timestamp: u64,
    }

    // ======== Events ========
    public struct UserWhitelistedEvent has copy, drop {
        user: address,
        whitelister: address,
        tx_digest: vector<u8>,
        timestamp: u64,
    }

    public struct EncryptionRecordedEvent has copy, drop {
        user: address,
        encryption_id: String,
        policy_object_id: String,
        package_id: String,
        timestamp: u64,
    }

    public struct BlobUploadRecordedEvent has copy, drop {
        user: address,
        uploader: address,
        data_owner: address,
        timestamp: u64,
    }

    public struct DIDCreationRecordedEvent has copy, drop {
        user: address,
        did_owner: address,
        digest: vector<u8>,
        timestamp: u64,
    }

    public struct UserAttestedEvent has copy, drop {
        user: address,
        timestamp: u64,
    }

    public struct MemberAddedEvent has copy, drop {
        member: address,
        role: u8,
        added_by: address,
    }

    public struct MemberRemovedEvent has copy, drop {
        member: address,
        role: u8,
        removed_by: address,
    }

    // ======== Functions ========
    
    /// Initialize the attestation system
    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        
        // Create and share the capability with the deployer as owner
        let cap = AttestationCap {
            id: object::new(ctx),
            owner: sender,
            whitelisters: vec_set::empty(),
            encrypters: vec_set::empty(),
            blob_uploaders: vec_set::empty(),
            did_creators: vec_set::empty()
        };
        transfer::share_object(cap);

        // Create and share the registry
        let registry = AttestationRegistry {
            id: object::new(ctx),
            whitelisted_users: table::new(ctx),
            attested_users: table::new(ctx),
            encryption_details: table::new(ctx),
            blob_upload_details: table::new(ctx),
            did_creation_details: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    // ======== Member Management Functions ========

    /// Add a member to a specific role
    public entry fun add_member(
        cap: &mut AttestationCap,
        member: address,
        role: u8,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Only the owner can add members
        assert!(sender == cap.owner, ENotOwner);
        
        // Add member to the appropriate role
        if (role == ROLE_WHITELISTER) {
            vec_set::insert(&mut cap.whitelisters, member);
        } else if (role == ROLE_ENCRYPTER) {
            vec_set::insert(&mut cap.encrypters, member);
        } else if (role == ROLE_BLOB_UPLOADER) {
            vec_set::insert(&mut cap.blob_uploaders, member);
        } else if (role == ROLE_DID_CREATOR) {
            vec_set::insert(&mut cap.did_creators, member);
        };
        
        // Emit event
        event::emit(MemberAddedEvent {
            member,
            role,
            added_by: sender
        });
    }

    /// Remove a member from a specific role
    public entry fun remove_member(
        cap: &mut AttestationCap,
        member: address,
        role: u8,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Only the owner can remove members
        assert!(sender == cap.owner, ENotOwner);
        
        // Remove member from the appropriate role
        if (role == ROLE_WHITELISTER && vec_set::contains(&cap.whitelisters, &member)) {
            vec_set::remove(&mut cap.whitelisters, &member);
        } else if (role == ROLE_ENCRYPTER && vec_set::contains(&cap.encrypters, &member)) {
            vec_set::remove(&mut cap.encrypters, &member);
        } else if (role == ROLE_BLOB_UPLOADER && vec_set::contains(&cap.blob_uploaders, &member)) {
            vec_set::remove(&mut cap.blob_uploaders, &member);
        } else if (role == ROLE_DID_CREATOR && vec_set::contains(&cap.did_creators, &member)) {
            vec_set::remove(&mut cap.did_creators, &member);
        };
        
        // Emit event
        event::emit(MemberRemovedEvent {
            member,
            role,
            removed_by: sender
        });
    }

    // ======== Attestation Functions ========

    /// Record a user as whitelisted
    public entry fun record_whitelisted_user(
        cap: &AttestationCap,
        registry: &mut AttestationRegistry,
        user: address,
        tx_digest: vector<u8>,
        timestamp: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify sender is authorized as a whitelister
        assert!(vec_set::contains(&cap.whitelisters, &sender), ENotAuthorized);
        
        // Verify timestamp is valid (not in the future)
        let current_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        assert!(timestamp <= current_time, EInvalidTimestamp);

        // Record the whitelist information
        let whitelist_info = WhitelistInfo {
            tx_digest,
            whitelister_address: sender,
            timestamp,
        };
        
        table::add(&mut registry.whitelisted_users, user, whitelist_info);

        // Emit event
        event::emit(UserWhitelistedEvent {
            user,
            whitelister: sender,
            tx_digest,
            timestamp,
        });
    }

    /// Record encryption details for a user
    public entry fun record_encryption_details(
        cap: &AttestationCap,
        registry: &mut AttestationRegistry,
        user: address,
        encryption_id: vector<u8>,
        policy_object_id: vector<u8>,
        package_id: vector<u8>,
        timestamp: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify sender is authorized as an encrypter
        assert!(vec_set::contains(&cap.encrypters, &sender), ENotAuthorized);
        
        // Verify timestamp is valid
        let current_time = clock::timestamp_ms(clock) / 1000;
        assert!(timestamp <= current_time, EInvalidTimestamp);

        // Verify user is whitelisted
        assert!(table::contains(&registry.whitelisted_users, user), EUserNotWhitelisted);

        // Record encryption details
        let encryption_details = EncryptionDetails {
            encryption_id: string::utf8(encryption_id),
            policy_object_id: string::utf8(policy_object_id),
            package_id: string::utf8(package_id),
            timestamp,
        };
        
        table::add(&mut registry.encryption_details, user, encryption_details);

        // Emit event
        event::emit(EncryptionRecordedEvent {
            user,
            encryption_id: string::utf8(encryption_id),
            policy_object_id: string::utf8(policy_object_id),
            package_id: string::utf8(package_id),
            timestamp,
        });
    }

    /// Record blob upload details
    public entry fun record_blob_upload(
        cap: &AttestationCap,
        registry: &mut AttestationRegistry,
        user: address,
        data_owner_address: address,
        timestamp: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify sender is authorized as a blob uploader
        assert!(vec_set::contains(&cap.blob_uploaders, &sender), ENotAuthorized);
        
        // Verify timestamp is valid
        let current_time = clock::timestamp_ms(clock) / 1000;
        assert!(timestamp <= current_time, EInvalidTimestamp);

        // Verify user is whitelisted
        assert!(table::contains(&registry.whitelisted_users, user), EUserNotWhitelisted);

        // Record blob upload details
        let blob_details = BlobUploadDetails {
            uploader_address: sender,
            data_owner_address,
            timestamp,
        };
        
        table::add(&mut registry.blob_upload_details, user, blob_details);

        // Emit event
        event::emit(BlobUploadRecordedEvent {
            user,
            uploader: sender,
            data_owner: data_owner_address,
            timestamp,
        });
    }

    /// Record DID creation details
    public entry fun record_did_creation(
        cap: &AttestationCap,
        registry: &mut AttestationRegistry,
        user: address,
        did_owner: address,
        digest: vector<u8>,
        timestamp: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify sender is authorized as a DID creator
        assert!(vec_set::contains(&cap.did_creators, &sender), ENotAuthorized);
        
        // Verify timestamp is valid
        let current_time = clock::timestamp_ms(clock) / 1000;
        assert!(timestamp <= current_time, EInvalidTimestamp);

        // Verify user is whitelisted
        assert!(table::contains(&registry.whitelisted_users, user), EUserNotWhitelisted);

        // Record DID creation details
        let did_details = DIDCreationDetails {
            did_owner,
            digest,
            timestamp,
        };
        
        table::add(&mut registry.did_creation_details, user, did_details);

        // Emit event
        event::emit(DIDCreationRecordedEvent {
            user,
            did_owner,
            digest,
            timestamp,
        });
    }

    /// Attest a whitelisted user after all required data is recorded
    /// This function can be called by any authorized member
    public entry fun attest_whitelisted_user(
        cap: &AttestationCap,
        registry: &mut AttestationRegistry,
        user: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify sender is authorized for any role
        assert!(
            vec_set::contains(&cap.whitelisters, &sender) ||
            vec_set::contains(&cap.encrypters, &sender) ||
            vec_set::contains(&cap.blob_uploaders, &sender) ||
            vec_set::contains(&cap.did_creators, &sender) ||
            sender == cap.owner,
            ENotAuthorized
        );
        
        // Verify user is whitelisted
        assert!(table::contains(&registry.whitelisted_users, user), EUserNotWhitelisted);
        
        // Verify user is not already attested
        assert!(!table::contains(&registry.attested_users, user), EUserAlreadyAttested);

        // Verify all required data is recorded
        assert!(table::contains(&registry.encryption_details, user), 0);
        assert!(table::contains(&registry.blob_upload_details, user), 0);
        assert!(table::contains(&registry.did_creation_details, user), 0);

        // Mark user as attested
        table::add(&mut registry.attested_users, user, true);

        // Emit attestation event
        event::emit(UserAttestedEvent {
            user,
            timestamp: clock::timestamp_ms(clock) / 1000,
        });
    }

    // ======== Query Functions ========

    /// Check if a user is attested
    public fun is_attested(registry: &AttestationRegistry, user: address): bool {
        table::contains(&registry.attested_users, user)
    }

    /// Get whitelist information for a user
    public fun get_whitelist_info(registry: &AttestationRegistry, user: address): &WhitelistInfo {
        table::borrow(&registry.whitelisted_users, user)
    }

    /// Get encryption details for a user
    public fun get_encryption_details(registry: &AttestationRegistry, user: address): &EncryptionDetails {
        table::borrow(&registry.encryption_details, user)
    }

    /// Get blob upload details for a user
    public fun get_blob_upload_details(registry: &AttestationRegistry, user: address): &BlobUploadDetails {
        table::borrow(&registry.blob_upload_details, user)
    }

    /// Get DID creation details for a user
    public fun get_did_creation_details(registry: &AttestationRegistry, user: address): &DIDCreationDetails {
        table::borrow(&registry.did_creation_details, user)
    }

    /// Check if an address is authorized for a specific role
    public fun is_authorized(cap: &AttestationCap, addr: address, role: u8): bool {
        if (role == ROLE_WHITELISTER) {
            vec_set::contains(&cap.whitelisters, &addr)
        } else if (role == ROLE_ENCRYPTER) {
            vec_set::contains(&cap.encrypters, &addr)
        } else if (role == ROLE_BLOB_UPLOADER) {
            vec_set::contains(&cap.blob_uploaders, &addr)
        } else if (role == ROLE_DID_CREATOR) {
            vec_set::contains(&cap.did_creators, &addr)
        } else {
            false
        }
    }

    /// Check if an address is the owner
    public fun is_owner(cap: &AttestationCap, addr: address): bool {
        cap.owner == addr
    }
}
/// DID SoulBoundNFT Contract with Whitelist:
/// - Users can create a DID (Decentralized Identity) as a SoulBoundNFT
/// - The DID is linked to encrypted Aadhar data stored in Walrus
/// - The DID cannot be transferred (SoulBound)
/// - Whitelisted addresses can access the encrypted data
///
/// Use cases:
/// - Identity verification while maintaining privacy
/// - Compliance with KYC requirements
/// - Secure storage of sensitive identity documents
///
module whitelist::did_whitelist_contract {

use sui::table::{Self, Table};
use sui::event;
use std::string::{Self, String};

// Error codes
const ENoAccess: u64 = 1;
const EInvalidCap: u64 = 2;
const EDuplicate: u64 = 3;
const ENotInWhitelist: u64 = 4;
const EAlreadyHasDID: u64 = 6;

/// Represents a whitelist of addresses
public struct Whitelist has key {
    id: UID,
    addresses: Table<address, bool>,
    // Track which addresses have DIDs
    did_owners: Table<address, ID>,
}

/// Admin capability for a whitelist
public struct Cap has key {
    id: UID,
    wl_id: ID,
}

/// SoulBoundNFT representing a DID
/// This cannot be transferred once created
public struct DID has key {
    id: UID,
    /// The owner of this DID
    owner: address,
    /// Reference to the whitelist this DID belongs to
    whitelist_id: ID,
    /// Encrypted data reference (encryption ID used with Seal)
    encryption_id: vector<u8>,
    /// Walrus blob ID where the encrypted data is stored
    blob_id: String,
    /// Optional metadata
    name: String,
    description: String,
}

// Events
public struct DIDCreated has copy, drop {
    id: ID,
    owner: address,
    whitelist_id: ID,
}

public struct AddedToWhitelist has copy, drop {
    whitelist_id: ID,
    address: address,
}

public struct RemovedFromWhitelist has copy, drop {
    whitelist_id: ID,
    address: address,
}

//////////////////////////////////////////
/////// Whitelist management functions

/// Create a whitelist with an admin cap.
/// The associated key-ids are [pkg id][whitelist id][nonce] for any nonce
public fun create_whitelist(ctx: &mut TxContext): (Cap, Whitelist) {
    let wl = Whitelist {
        id: object::new(ctx),
        addresses: table::new(ctx),
        did_owners: table::new(ctx),
    };
    let cap = Cap {
        id: object::new(ctx),
        wl_id: object::id(&wl),
    };
    (cap, wl)
}

/// Helper function for creating a whitelist and send it back to sender.
entry fun create_whitelist_entry(ctx: &mut TxContext) {
    let (cap, wl) = create_whitelist(ctx);
    transfer::share_object(wl);
    transfer::transfer(cap, tx_context::sender(ctx));
}

/// Add an address to the whitelist
public fun add(wl: &mut Whitelist, cap: &Cap, account: address) {
    assert!(cap.wl_id == object::id(wl), EInvalidCap);
    assert!(!table::contains(&wl.addresses, account), EDuplicate);
    table::add(&mut wl.addresses, account, true);
    
    // Emit event
    event::emit(AddedToWhitelist {
        whitelist_id: object::id(wl),
        address: account,
    });
}

/// Remove an address from the whitelist
public fun remove(wl: &mut Whitelist, cap: &Cap, account: address) {
    assert!(cap.wl_id == object::id(wl), EInvalidCap);
    assert!(table::contains(&wl.addresses, account), ENotInWhitelist);
    table::remove(&mut wl.addresses, account);
    
    // Emit event
    event::emit(RemovedFromWhitelist {
        whitelist_id: object::id(wl),
        address: account,
    });
}

//////////////////////////////////////////
/////// DID management functions

/// Create a new DID SoulBoundNFT
/// This can only be called by a whitelisted address
public fun create_did(
    wl: &mut Whitelist,
    encryption_id: vector<u8>,
    blob_id: String,
    name: String,
    description: String,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    
    // Check if sender is in whitelist
    assert!(table::contains(&wl.addresses, sender), ENotInWhitelist);
    
    // Check if sender already has a DID
    assert!(!table::contains(&wl.did_owners, sender), EAlreadyHasDID);
    
    // Create the DID
    let did = DID {
        id: object::new(ctx),
        owner: sender,
        whitelist_id: object::id(wl),
        encryption_id,
        blob_id,
        name,
        description,
    };
    
    // Register the DID in the whitelist
    table::add(&mut wl.did_owners, sender, object::id(&did));
    
    // Emit event
    event::emit(DIDCreated {
        id: object::id(&did),
        owner: sender,
        whitelist_id: object::id(wl),
    });
    
    // Transfer the DID to the sender (SoulBound - cannot be transferred again)
    transfer::transfer(did, sender);
}

/// Entry function to create a DID
entry fun create_did_entry(
    wl: &mut Whitelist,
    encryption_id: vector<u8>,
    blob_id: vector<u8>,
    name: vector<u8>,
    description: vector<u8>,
    ctx: &mut TxContext
) {
    create_did(
        wl,
        encryption_id,
        string::utf8(blob_id),
        string::utf8(name),
        string::utf8(description),
        ctx
    );
}

/// Check if a user has a DID in the whitelist
public fun has_did(wl: &Whitelist, account: address): bool {
    table::contains(&wl.did_owners, account)
}

/// Get the DID ID for a user
public fun get_did_id(wl: &Whitelist, account: address): ID {
    assert!(table::contains(&wl.did_owners, account), ENotInWhitelist);
    *table::borrow(&wl.did_owners, account)
}

//////////////////////////////////////////////////////////
/// Access control functions

/// Check if a user has access to a specific ID
/// key format: [pkg id][whitelist id][random nonce]
fun check_policy(caller: address, id: vector<u8>, wl: &Whitelist): bool {
    // Check if the id has the right prefix
    let prefix = object::uid_to_bytes(&wl.id);
    let mut i = 0;
    if (vector::length(&prefix) > vector::length(&id)) {
        return false
    };
    while (i < vector::length(&prefix)) {
        if (*vector::borrow(&prefix, i) != *vector::borrow(&id, i)) {
            return false
        };
        i = i + 1;
    };

    // Check if user is in the whitelist
    table::contains(&wl.addresses, caller)
}

/// Entry function to check if caller has access to an ID
entry fun seal_approve(id: vector<u8>, wl: &Whitelist, ctx: &TxContext) {
    assert!(check_policy(tx_context::sender(ctx), id, wl), ENoAccess);
}

/// Function to verify a DID belongs to a specific user
/// This can be used by services that need to verify identity
public fun verify_did_owner(did: &DID, expected_owner: address): bool {
    did.owner == expected_owner
}

/// Function to get the encryption ID from a DID
/// This can only be called by the owner or a whitelisted address
public fun get_encryption_id(did: &DID, wl: &Whitelist, ctx: &TxContext): vector<u8> {
    let caller = tx_context::sender(ctx);
    
    // Check if caller is the owner or in the whitelist
    assert!(did.owner == caller || table::contains(&wl.addresses, caller), ENoAccess);
    
    // Return the encryption ID
    did.encryption_id
}

/// Function to get the blob ID from a DID
/// This can only be called by the owner or a whitelisted address
public fun get_blob_id(did: &DID, wl: &Whitelist, ctx: &TxContext): String {
    let caller = tx_context::sender(ctx);
    
    // Check if caller is the owner or in the whitelist
    assert!(did.owner == caller || table::contains(&wl.addresses, caller), ENoAccess);
    
    // Return the blob ID
    did.blob_id
}

#[test_only]
public fun destroy_for_testing(wl: Whitelist, cap: Cap) {
    let Whitelist { id, addresses, did_owners } = wl;
    table::drop(addresses);
    table::drop(did_owners);
    object::delete(id);
    let Cap { id, wl_id: _ } = cap;
    object::delete(id);
}


}
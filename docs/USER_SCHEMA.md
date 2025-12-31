# User Schema Documentation

Complete documentation for the User collection in Firestore.

## Collection Name: `users`

Document ID: Firebase Auth UID (automatically generated)

---

## Fields Reference

### Required Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `uid` | String | Unique user identifier from Firebase Auth | `"abc123xyz456"` |
| `name` | String | User's full name | `"John Doe"` |
| `email` | String | User's email address | `"john.doe@example.com"` |
| `role` | String | User role (enum) | `"customer"` or `"admin"` |
| `authProvider` | String | Authentication method used | `"Email"`, `"Google"`, `"Facebook"` |
| `isPhoneVerified` | Boolean | Phone number verification status | `true` or `false` |
| `isEmailVerified` | Boolean | Email verification status | `true` or `false` |
| `accountStatus` | String | Current account status (enum) | `"active"`, `"blocked"`, `"suspended"` |
| `lastLogin` | String (ISO 8601) | Last login timestamp | `"2025-12-31T10:30:00.000Z"` |
| `wishlist` | Array\<String\> | Array of product IDs | `["prod1", "prod2"]` |
| `createdAt` | String (ISO 8601) | Account creation timestamp | `"2025-01-01T08:00:00.000Z"` |
| `updatedAt` | String (ISO 8601) | Last update timestamp | `"2025-12-31T10:30:00.000Z"` |

### Optional Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `phoneNumber` | String \| null | User's phone number in international format | `"+1234567890"` or `null` |
| `photoURL` | String \| null | URL to user's profile photo | `"https://example.com/photo.jpg"` or `null` |
| `address` | Object \| String \| null | Shipping address (collected during order) | See Address Schema below |
| `linkedProviders` | Array\<Object\> | List of linked OAuth providers | See Linked Providers Schema below |

---

## Enum Values

### role
- `"customer"` - Default role for new users
- `"admin"` - Administrative privileges

### authProvider
- `"Email"` - Email/password authentication
- `"Google"` - Google OAuth
- `"Facebook"` - Facebook OAuth
- Other social providers as needed

### accountStatus
- `"active"` - Normal account, can log in and place orders
- `"blocked"` - Account is blocked, cannot log in
- `"suspended"` - Account is temporarily suspended, cannot log in

---

## Address Schema

The `address` field can be stored as either a structured object or a simple string.

### Recommended Object Format

```json
{
  "street": "123 Main Street",
  "apartment": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}
```

### Alternative Simple Format

```json
"123 Main Street, Apt 4B, New York, NY 10001, USA"
```

## Linked Providers Schema

The `linkedProviders` field stores information about OAuth providers linked to the account.

### Provider Object Format

```json
{
  "provider": "Google",
  "providerUid": "google-user-id-123",
  "email": "user@gmail.com",
  "linkedAt": "2025-12-31T10:00:00.000Z"
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `provider` | String | OAuth provider name (`"Google"`, `"Facebook"`, `"Twitter"`, etc.) |
| `providerUid` | String | User ID from the OAuth provider |
| `email` | String | Email associated with this provider |
| `linkedAt` | String (ISO) | Timestamp when provider was linked |

### Example

```json
"linkedProviders": [
  {
    "provider": "Google",
    "providerUid": "google-123456",
    "email": "user@gmail.com",
    "linkedAt": "2025-12-31T10:00:00.000Z"
  },
  {
    "provider": "Facebook",
    "providerUid": "fb-789012",
    "email": "user@fb.com",
    "linkedAt": "2025-12-31T11:00:00.000Z"
  }
]
```

---

## Complete Example Document

```json
{
  "uid": "xyz789abc123",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phoneNumber": "+1234567890",
  "photoURL": "https://example.com/profiles/jane-smith.jpg",
  "role": "customer",
  "authProvider": "Google",
  "isPhoneVerified": true,
  "isEmailVerified": true,
  "accountStatus": "active",
  "lastLogin": "2025-12-31T14:23:15.000Z",
  "address": {
    "street": "456 Oak Avenue",
    "apartment": "Suite 200",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA"
  },
  "wishlist": [
    "prod_123abc",
    "prod_456def",
    "prod_789ghi"
  ],
  "linkedProviders": [
    {
      "provider": "Google",
      "providerUid": "google-xyz789",
      "email": "jane.smith@gmail.com",
      "linkedAt": "2025-01-15T09:00:00.000Z"
    }
  ],
  "createdAt": "2025-01-15T09:00:00.000Z",
  "updatedAt": "2025-12-31T14:23:15.000Z"
}
```

---

## Field Validation Rules

### On Registration (Email/Password)

**Required:**
- `email` - Must be valid email format
- `password` - Minimum 6 characters (handled by Firebase Auth)
- `name` - Cannot be empty

**Optional:**
- `phoneNumber` - Must be valid mobile number format
- `photoURL` - Must be valid URL
- `authProvider` - Defaults to "Email"

**Auto-Generated:**
- `uid` - Firebase Auth UID
- `role` - Defaults to "customer"
- `isPhoneVerified` - Defaults to `false`
- `isEmailVerified` - Defaults to `false`
- `accountStatus` - Defaults to "active"
- `lastLogin` - Set to current timestamp
- `address` - Defaults to `null`
- `wishlist` - Defaults to `[]`
- `createdAt` - Current timestamp
- `updatedAt` - Current timestamp

### On Social Authentication

**Required:**
- `uid` - From OAuth provider
- `email` - From OAuth provider
- `name` - From OAuth provider
- `authProvider` - "Google", "Facebook", etc.

**Optional:**
- `phoneNumber` - From OAuth provider (if available)
- `photoURL` - From OAuth provider

**Auto-Generated:**
- Same as email registration, except:
  - `isEmailVerified` - Defaults to `true` (verified by OAuth provider)

### On Profile Update

**Allowed Fields:**
- `name`
- `phoneNumber`
- `address`
- `photoURL`

**Auto-Updated:**
- `updatedAt` - Set to current timestamp

**Protected Fields (Cannot be updated by user):**
- `uid`
- `email`
- `role` (only admin can change)
- `authProvider`
- `isPhoneVerified` (only via verification endpoint)
- `isEmailVerified` (only via verification endpoint)
- `accountStatus` (only admin can change)
- `lastLogin` (auto-updated on login)
- `wishlist` (only via wishlist endpoints)
- `createdAt`

---

## Wishlist Management

The `wishlist` field is an array of product IDs that the user has saved.

### Add to Wishlist
- Check if product exists
- Check if product is not already in wishlist
- Add product ID to array
- Update `updatedAt`

### Remove from Wishlist
- Filter out the product ID from array
- Update `updatedAt`

### Get Wishlist
- Fetch full product details for each product ID
- Return array of product objects

---

## Account Status Transitions

### Active → Blocked
- Admin action
- User cannot log in
- Existing sessions remain valid until token expires

### Active → Suspended
- Admin action
- User cannot log in
- Can be reactivated

### Blocked/Suspended → Active
- Admin action
- User can log in again

---

## Security Considerations

1. **Email Uniqueness**: Enforced by Firebase Auth
2. **Password Storage**: Handled by Firebase Auth (not stored in Firestore)
3. **Role Changes**: Only admins can promote users to admin
4. **Account Status**: Only admins can block/suspend accounts
5. **Sensitive Data**: Phone numbers and addresses should be protected
6. **Wishlist Privacy**: Users can only access their own wishlist

---

## Indexes Required

For optimal query performance, create these Firestore indexes:

### Single Field Indexes
- `role` (ascending)
- `accountStatus` (ascending)
- `authProvider` (ascending)
- `createdAt` (descending)

### Composite Indexes
- `accountStatus` (ascending) + `role` (ascending)
- `role` (ascending) + `createdAt` (descending)

These indexes are automatically created when you run the queries that need them.

---

## Related Endpoints

### User Management
- `GET /api/users/profile` - Get own profile
- `PUT /api/users/profile` - Update own profile
- `POST /api/users/verify-phone` - Verify phone number
- `POST /api/users/verify-email` - Verify email

### Wishlist Management
- `GET /api/users/wishlist` - Get wishlist
- `POST /api/users/wishlist` - Add to wishlist
- `DELETE /api/users/wishlist/:productId` - Remove from wishlist

### Admin Operations
- `GET /api/users` - Get all users (with filters)
- `PUT /api/users/:uid/set-admin` - Promote to admin
- `PUT /api/users/:uid/account-status` - Change account status

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

# Order Schema Documentation

Complete documentation for the Order collection in Firestore for E-Commerce Clothing Store.

## Collection Name: `orders`

Document ID: Auto-generated unique order ID

---

## Fields Reference

### Required Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `orderId` | String | Unique order identifier (auto-generated) | `"order_abc123"` |
| `orderNumber` | String | User-facing order number | `"ORD-2025-001234"` |
| `userId` | String | Reference to user who placed order | `"user_xyz789"` |
| `userEmail` | String | User's email at time of order | `"user@example.com"` |
| `userName` | String | User's name at time of order | `"John Doe"` |
| `userPhone` | String | User's phone number | `"+1234567890"` |
| `orderItems` | Array\<Object\> | List of ordered products | See Order Item Schema |
| `subtotal` | Number | Sum of all items before discounts | `2500.00` |
| `discount` | Number | Total discount amount | `250.00` |
| `tax` | Number | Total tax amount | `405.00` |
| `deliveryCharges` | Number | Shipping/delivery charges | `100.00` |
| `totalAmount` | Number | Final amount (subtotal - discount + tax + delivery) | `2755.00` |
| `currencyType` | String | Currency code | `"INR"`, `"USD"` |
| `orderStatus` | String | Current order status | See Order Status Enum |
| `paymentStatus` | String | Payment status | See Payment Status Enum |
| `paymentMethod` | String | Payment method used | See Payment Method Enum |
| `shippingAddress` | Object | Delivery address | See Address Schema |
| `createdAt` | String (ISO) | Order creation timestamp | `"2025-12-31T10:00:00.000Z"` |
| `updatedAt` | String (ISO) | Last update timestamp | `"2025-12-31T10:00:00.000Z"` |

### Optional Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `offerApplied` | Object | Coupon/offer details | See Offer Schema |
| `billingAddress` | Object | Billing address (if different from shipping) | See Address Schema |
| `trackingNumber` | String | Courier tracking number | `"TRK123456789"` |
| `courierService` | String | Delivery courier name | `"BlueDart"`, `"FedEx"` |
| `estimatedDelivery` | String (ISO) | Estimated delivery date | `"2026-01-05T00:00:00.000Z"` |
| `actualDelivery` | String (ISO) | Actual delivery timestamp | `"2026-01-04T14:30:00.000Z"` |
| `paymentId` | String | Payment transaction ID | `"pay_abc123xyz"` |
| `customerNotes` | String | Customer's special instructions | `"Please deliver after 6 PM"` |
| `internalNotes` | String | Admin notes (not visible to customer) | `"Customer requested gift wrap"` |
| `confirmedAt` | String (ISO) | Order confirmation timestamp | `"2025-12-31T10:05:00.000Z"` |
| `shippedAt` | String (ISO) | Order shipment timestamp | `"2026-01-01T09:00:00.000Z"` |
| `deliveredAt` | String (ISO) | Order delivery timestamp | `"2026-01-04T14:30:00.000Z"` |
| `cancelledAt` | String (ISO) | Order cancellation timestamp | `"2025-12-31T11:00:00.000Z"` |
| `cancellationReason` | String | Reason for cancellation | `"Changed mind"`, `"Found better price"` |
| `returnedAt` | String (ISO) | Return initiation timestamp | `"2026-01-10T10:00:00.000Z"` |
| `returnReason` | String | Reason for return | `"Wrong size"`, `"Damaged product"` |
| `refundAmount` | Number | Amount refunded | `2755.00` |
| `refundStatus` | String | Refund status | `"pending"`, `"completed"`, `"rejected"` |
| `refundedAt` | String (ISO) | Refund completion timestamp | `"2026-01-12T10:00:00.000Z"` |

---

## Order Item Schema

Each item in the `orderItems` array:

```json
{
  "productId": "prod_abc123",
  "productName": "Cotton Casual Kurta",
  "productImage": "https://example.com/kurta.jpg",
  "category": "men",
  "subCategory": "ethnic",
  "productType": "kurta",
  "size": "M",
  "color": {
    "colorName": "White",
    "colorCode": "#FFFFFF"
  },
  "quantity": 2,
  "pricePerUnit": 999,
  "discount": 199.80,
  "tax": 143.82,
  "totalPrice": 1943.82,
  "sku": "MEN-KURTA-WHT-M-001"
}
```

### Order Item Fields

| Field | Type | Description |
|-------|------|-------------|
| `productId` | String | Reference to product |
| `productName` | String | Product name (snapshot at time of order) |
| `productImage` | String | Primary product image URL |
| `category` | String | Product category |
| `subCategory` | String | Product subcategory |
| `productType` | String | Product type |
| `size` | String | Selected size |
| `color` | Object | Selected color with name and code |
| `quantity` | Number | Quantity ordered |
| `pricePerUnit` | Number | Price per unit at time of order |
| `discount` | Number | Discount per item |
| `tax` | Number | Tax per item |
| `totalPrice` | Number | Total price for this item (quantity × price - discount + tax) |
| `sku` | String | Product SKU |

---

## Address Schema

```json
{
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400001",
  "country": "India",
  "landmark": "Near City Mall",
  "addressType": "home"
}
```

### Address Fields

| Field | Type | Description |
|-------|------|-------------|
| `fullName` | String | Recipient name |
| `phoneNumber` | String | Contact number |
| `addressLine1` | String | Primary address line |
| `addressLine2` | String | Secondary address line (optional) |
| `city` | String | City name |
| `state` | String | State/Province |
| `postalCode` | String | ZIP/Postal code |
| `country` | String | Country name |
| `landmark` | String | Nearby landmark (optional) |
| `addressType` | String | Address type (`"home"`, `"work"`, `"other"`) |

---

## Offer Applied Schema

```json
{
  "couponCode": "SUMMER20",
  "discountType": "percentage",
  "discountValue": 20,
  "discountAmount": 500,
  "description": "Summer Sale - 20% off"
}
```

### Offer Fields

| Field | Type | Description |
|-------|------|-------------|
| `couponCode` | String | Coupon code used |
| `discountType` | String | Type of discount (`"percentage"`, `"amount"`, `"free-shipping"`) |
| `discountValue` | Number | Discount value (20 for 20% or fixed amount) |
| `discountAmount` | Number | Calculated discount amount |
| `description` | String | Offer description |

---

## Enum Values

### Order Status

| Status | Description |
|--------|-------------|
| `pending` | Order placed, awaiting confirmation |
| `confirmed` | Order confirmed by system/admin |
| `processing` | Order is being prepared |
| `packed` | Order has been packed |
| `shipped` | Order has been shipped |
| `out-for-delivery` | Out for delivery |
| `delivered` | Order successfully delivered |
| `cancelled` | Order cancelled |
| `returned` | Order returned by customer |
| `refunded` | Payment refunded |
| `failed` | Order processing failed |

### Payment Status

| Status | Description |
|--------|-------------|
| `pending` | Payment not yet completed |
| `completed` | Payment successful |
| `failed` | Payment failed |
| `refunded` | Payment refunded |
| `partially-refunded` | Partial refund completed |

### Payment Method

| Method | Description |
|--------|-------------|
| `cod` | Cash on Delivery |
| `card` | Credit/Debit Card |
| `upi` | UPI Payment |
| `netbanking` | Net Banking |
| `wallet` | Digital Wallet |
| `emi` | EMI Payment |

### Refund Status

| Status | Description |
|--------|-------------|
| `not-requested` | No refund requested |
| `requested` | Refund requested |
| `pending` | Refund in process |
| `completed` | Refund completed |
| `rejected` | Refund rejected |

---

## Complete Order Example

```json
{
  "orderId": "order_2025_abc123",
  "orderNumber": "ORD-2025-001234",
  "userId": "user_xyz789",
  "userEmail": "john.doe@example.com",
  "userName": "John Doe",
  "userPhone": "+919876543210",

  "orderItems": [
    {
      "productId": "prod_kurta_001",
      "productName": "Cotton Casual Kurta",
      "productImage": "https://example.com/images/kurta-white.jpg",
      "category": "men",
      "subCategory": "ethnic",
      "productType": "kurta",
      "size": "M",
      "color": {
        "colorName": "White",
        "colorCode": "#FFFFFF"
      },
      "quantity": 2,
      "pricePerUnit": 999,
      "discount": 199.80,
      "tax": 143.82,
      "totalPrice": 1943.82,
      "sku": "MEN-KURTA-WHT-M-001"
    },
    {
      "productId": "prod_jeans_002",
      "productName": "Slim Fit Denim Jeans",
      "productImage": "https://example.com/images/jeans-blue.jpg",
      "category": "men",
      "subCategory": "casual",
      "productType": "jeans",
      "size": "32",
      "color": {
        "colorName": "Blue",
        "colorCode": "#0000FF"
      },
      "quantity": 1,
      "pricePerUnit": 1499,
      "discount": 149.90,
      "tax": 242.84,
      "totalPrice": 1591.94,
      "sku": "MEN-JEANS-BLU-32-002"
    }
  ],

  "subtotal": 3497,
  "discount": 349.70,
  "tax": 386.66,
  "deliveryCharges": 100,
  "totalAmount": 3633.96,
  "currencyType": "INR",

  "offerApplied": {
    "couponCode": "FIRST10",
    "discountType": "percentage",
    "discountValue": 10,
    "discountAmount": 349.70,
    "description": "First Order - 10% off"
  },

  "shippingAddress": {
    "fullName": "John Doe",
    "phoneNumber": "+919876543210",
    "addressLine1": "123 Marine Drive",
    "addressLine2": "Apartment 5C",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400020",
    "country": "India",
    "landmark": "Near Gateway of India",
    "addressType": "home"
  },

  "billingAddress": {
    "fullName": "John Doe",
    "phoneNumber": "+919876543210",
    "addressLine1": "123 Marine Drive",
    "addressLine2": "Apartment 5C",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400020",
    "country": "India",
    "addressType": "home"
  },

  "orderStatus": "shipped",
  "paymentStatus": "completed",
  "paymentMethod": "upi",
  "paymentId": "pay_abc123xyz",

  "trackingNumber": "TRK987654321",
  "courierService": "BlueDart",
  "estimatedDelivery": "2026-01-05T00:00:00.000Z",

  "customerNotes": "Please call before delivery",
  "internalNotes": "Premium customer - priority delivery",

  "createdAt": "2025-12-31T10:00:00.000Z",
  "updatedAt": "2026-01-02T09:00:00.000Z",
  "confirmedAt": "2025-12-31T10:05:00.000Z",
  "shippedAt": "2026-01-02T09:00:00.000Z",

  "refundStatus": "not-requested"
}
```

---

## Price Calculation Logic

### Subtotal
```javascript
const subtotal = orderItems.reduce((sum, item) => {
  return sum + (item.pricePerUnit * item.quantity);
}, 0);
```

### Item Discount
```javascript
// Per item discount based on offer
const itemDiscount = (pricePerUnit * quantity) * (offerValue / 100);
```

### Item Tax
```javascript
// Calculate tax on discounted price
const priceAfterDiscount = (pricePerUnit * quantity) - itemDiscount;
const itemTax = priceAfterDiscount * (taxRate / 100);
```

### Total Amount
```javascript
const totalAmount = subtotal - discount + tax + deliveryCharges;
```

---

## Order Status Flow

### Normal Flow
1. `pending` → Order created
2. `confirmed` → Payment verified/admin confirmed
3. `processing` → Order being prepared
4. `packed` → Items packed
5. `shipped` → Handed to courier
6. `out-for-delivery` → Out for delivery
7. `delivered` → Successfully delivered

### Cancellation Flow
1. `pending/confirmed` → `cancelled` (before shipping)

### Return Flow
1. `delivered` → `returned` → `refunded`

---

## Validation Rules

### On Order Creation

**Required:**
- `userId` - Valid user ID
- `orderItems` - Array with at least 1 item
- `shippingAddress` - Complete address
- `paymentMethod` - Valid payment method
- `subtotal`, `tax`, `deliveryCharges`, `totalAmount` - Valid numbers

**Automatic:**
- `orderId` - Auto-generated
- `orderNumber` - Auto-generated (ORD-YYYY-NNNNNN)
- `orderStatus` - Default: `pending`
- `paymentStatus` - Default: `pending` (or `completed` for COD)
- `createdAt`, `updatedAt` - Current timestamp

### On Order Update

- Cannot update `orderId`, `orderNumber`, `userId`
- Cannot change `orderStatus` backward (except cancellation)
- `totalAmount` must match calculation
- `updatedAt` automatically updated

### Stock Management

**On Order Placement:**
- Reduce product stock by ordered quantity
- Reduce color-specific stock

**On Order Cancellation:**
- Restore product stock
- Restore color-specific stock

**On Order Return:**
- Restore product stock
- Restore color-specific stock

---

## Indexes Required

For optimal query performance, create these Firestore indexes:

### Single Field Indexes
- `userId` (ascending)
- `orderStatus` (ascending)
- `paymentStatus` (ascending)
- `createdAt` (descending)
- `orderNumber` (ascending)

### Composite Indexes
- `userId` (ascending) + `createdAt` (descending)
- `userId` (ascending) + `orderStatus` (ascending)
- `orderStatus` (ascending) + `createdAt` (descending)
- `paymentStatus` (ascending) + `createdAt` (descending)

---

## Best Practices

1. **Always snapshot product data** - Store product details in order (name, price, image) as they may change later
2. **Validate stock before order** - Check if sufficient stock available
3. **Use transactions for stock updates** - Prevent overselling
4. **Generate unique order numbers** - User-friendly order tracking
5. **Store addresses as copies** - Don't reference user's address (may be deleted/changed)
6. **Track all status changes** - Maintain audit trail with timestamps
7. **Calculate prices server-side** - Never trust client-side calculations
8. **Verify payment before confirmation** - For online payments
9. **Send order confirmations** - Email/SMS notifications
10. **Allow limited time cancellation** - Before order is shipped

---

## Related Collections

### Order History (Optional)
Track all status changes:

```json
{
  "orderId": "order_abc123",
  "status": "shipped",
  "previousStatus": "packed",
  "changedBy": "admin_xyz",
  "notes": "Order shipped via BlueDart",
  "timestamp": "2026-01-02T09:00:00.000Z"
}
```

---

For implementation details, see:
- [Order Controller](../src/controllers/order.controller.js)
- [Order Routes](../src/routes/order.routes.js)
- [Order Validation](../src/validations/order.validation.js)
- [API Documentation](API_DOCUMENTATION.md)

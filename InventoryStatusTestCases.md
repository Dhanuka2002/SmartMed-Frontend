# Inventory Management - Status Calculation Test Cases

## Overview
This document contains comprehensive test cases for the inventory status calculation functionality in the InventoryManagement component.

## Current Logic Analysis
- **Expired**: Medicine expiry date < today's date
- **Near Expiry**: Medicine expires within 30 days (daysUntilExpiry <= 30 and > 0)
- **Low Stock**: Medicine quantity <= minimum stock level
- **In Stock**: Default status when none of the above conditions are met

## Test Cases

### 1. Expired Medicine Status
**Test Case ID**: TC_INV_001
**Test Description**: Verify that medicines with expiry date in the past show "Expired" status
**Priority**: High

**Test Data**:
```javascript
const expiredMedicine = {
  id: 1,
  name: "Paracetamol",
  quantity: 100,
  minStock: 50,
  expiry: "2023-12-31", // Past date
  category: "Analgesic"
};
```

**Expected Result**: Status should be "Expired"
**Test Steps**:
1. Create medicine object with expiry date in the past
2. Call getStatus(expiredMedicine)
3. Verify returned status is "Expired"

### 2. Near Expiry Medicine Status - Within 30 Days
**Test Case ID**: TC_INV_002
**Test Description**: Verify that medicines expiring within 30 days show "Near Expiry" status
**Priority**: High

**Test Data**:
```javascript
// Calculate date 15 days from today
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 15);
const nearExpiryMedicine = {
  id: 2,
  name: "Amoxicillin",
  quantity: 75,
  minStock: 25,
  expiry: futureDate.toISOString().split('T')[0], // 15 days from today
  category: "Antibiotic"
};
```

**Expected Result**: Status should be "Near Expiry"
**Test Steps**:
1. Create medicine object with expiry date 15 days from today
2. Call getStatus(nearExpiryMedicine)
3. Verify returned status is "Near Expiry"

### 3. Near Expiry Medicine Status - Exactly 30 Days
**Test Case ID**: TC_INV_003
**Test Description**: Verify that medicines expiring exactly in 30 days show "Near Expiry" status
**Priority**: Medium

**Test Data**:
```javascript
// Calculate date exactly 30 days from today
const exactDate = new Date();
exactDate.setDate(exactDate.getDate() + 30);
const exactNearExpiryMedicine = {
  id: 3,
  name: "Ibuprofen",
  quantity: 200,
  minStock: 100,
  expiry: exactDate.toISOString().split('T')[0], // Exactly 30 days
  category: "Anti-inflammatory"
};
```

**Expected Result**: Status should be "Near Expiry"

### 4. Near Expiry Medicine Status - 1 Day Left
**Test Case ID**: TC_INV_004
**Test Description**: Verify that medicines expiring tomorrow show "Near Expiry" status
**Priority**: High

**Test Data**:
```javascript
// Calculate tomorrow's date
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowExpiryMedicine = {
  id: 4,
  name: "Aspirin",
  quantity: 50,
  minStock: 20,
  expiry: tomorrow.toISOString().split('T')[0], // Tomorrow
  category: "Analgesic"
};
```

**Expected Result**: Status should be "Near Expiry"

### 5. Low Stock Medicine Status
**Test Case ID**: TC_INV_005
**Test Description**: Verify that medicines with quantity equal to minimum stock show "Low Stock" status
**Priority**: High

**Test Data**:
```javascript
// Calculate date far in future to avoid expiry issues
const farFuture = new Date();
farFuture.setFullYear(farFuture.getFullYear() + 2);
const lowStockMedicine = {
  id: 5,
  name: "Vitamin C",
  quantity: 25, // Equal to minStock
  minStock: 25,
  expiry: farFuture.toISOString().split('T')[0], // 2 years from now
  category: "Vitamin"
};
```

**Expected Result**: Status should be "Low Stock"

### 6. Low Stock Medicine Status - Below Minimum
**Test Case ID**: TC_INV_006
**Test Description**: Verify that medicines with quantity below minimum stock show "Low Stock" status
**Priority**: High

**Test Data**:
```javascript
const belowMinStockMedicine = {
  id: 6,
  name: "Antiseptic",
  quantity: 10, // Below minStock
  minStock: 20,
  expiry: "2025-12-31", // Future date
  category: "Antiseptic"
};
```

**Expected Result**: Status should be "Low Stock"

### 7. In Stock Medicine Status
**Test Case ID**: TC_INV_007
**Test Description**: Verify that medicines with good quantity and future expiry show "In Stock" status
**Priority**: Medium

**Test Data**:
```javascript
const inStockMedicine = {
  id: 7,
  name: "Multivitamin",
  quantity: 100, // Above minStock
  minStock: 30,
  expiry: "2025-12-31", // More than 30 days away
  category: "Vitamin"
};
```

**Expected Result**: Status should be "In Stock"

### 8. Priority Testing - Expired vs Low Stock
**Test Case ID**: TC_INV_008
**Test Description**: Verify that expired status takes priority over low stock status
**Priority**: High

**Test Data**:
```javascript
const expiredLowStockMedicine = {
  id: 8,
  name: "Old Medicine",
  quantity: 5, // Below minStock (10)
  minStock: 10,
  expiry: "2023-06-01", // Expired
  category: "Other"
};
```

**Expected Result**: Status should be "Expired" (not "Low Stock")

### 9. Priority Testing - Near Expiry vs Low Stock
**Test Case ID**: TC_INV_009
**Test Description**: Verify that near expiry status takes priority over low stock status
**Priority**: High

**Test Data**:
```javascript
const nearExpiryLowStockMedicine = {
  id: 9,
  name: "Expiring Soon",
  quantity: 15, // Below minStock (20)
  minStock: 20,
  expiry: "2024-02-15", // Within 30 days but not expired
  category: "Analgesic"
};
```

**Expected Result**: Status should be "Near Expiry" (not "Low Stock")

### 10. Edge Case - Today's Expiry
**Test Case ID**: TC_INV_010
**Test Description**: Verify medicine expiring today shows "Expired" status
**Priority**: High

**Test Data**:
```javascript
const todayExpiryMedicine = {
  id: 10,
  name: "Expires Today",
  quantity: 50,
  minStock: 25,
  expiry: new Date().toISOString().split('T')[0], // Today
  category: "Other"
};
```

**Expected Result**: Status should be "Expired"

### 11. Edge Case - 31 Days Until Expiry
**Test Case ID**: TC_INV_011
**Test Description**: Verify medicine expiring in 31 days shows "In Stock" status (not Near Expiry)
**Priority**: Medium

**Test Data**:
```javascript
const thirtyOneDaysExpiry = new Date();
thirtyOneDaysExpiry.setDate(thirtyOneDaysExpiry.getDate() + 31);
const notNearExpiryMedicine = {
  id: 11,
  name: "Safe Stock",
  quantity: 100,
  minStock: 50,
  expiry: thirtyOneDaysExpiry.toISOString().split('T')[0], // 31 days
  category: "Vitamin"
};
```

**Expected Result**: Status should be "In Stock"

### 12. Edge Case - Zero Quantity
**Test Case ID**: TC_INV_012
**Test Description**: Verify medicine with zero quantity shows "Low Stock" status
**Priority**: High

**Test Data**:
```javascript
const zeroQuantityMedicine = {
  id: 12,
  name: "Out of Stock",
  quantity: 0, // Zero quantity
  minStock: 10,
  expiry: "2025-12-31", // Future date
  category: "Antibiotic"
};
```

**Expected Result**: Status should be "Low Stock"

## Automated Test Implementation Example

```javascript
// Jest test implementation example
describe('Inventory Status Calculation', () => {

  const getStatus = (medicine) => {
    const today = new Date();
    const expiryDate = new Date(medicine.expiry);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (expiryDate < today) {
      return "Expired";
    } else if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      return "Near Expiry";
    } else if (medicine.quantity <= medicine.minStock) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  test('TC_INV_001: Should return Expired for past expiry date', () => {
    const medicine = {
      id: 1,
      name: "Paracetamol",
      quantity: 100,
      minStock: 50,
      expiry: "2023-12-31",
      category: "Analgesic"
    };
    expect(getStatus(medicine)).toBe("Expired");
  });

  test('TC_INV_002: Should return Near Expiry for medicine expiring in 15 days', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    const medicine = {
      id: 2,
      name: "Amoxicillin",
      quantity: 75,
      minStock: 25,
      expiry: futureDate.toISOString().split('T')[0],
      category: "Antibiotic"
    };
    expect(getStatus(medicine)).toBe("Near Expiry");
  });

  test('TC_INV_005: Should return Low Stock when quantity equals minStock', () => {
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 2);
    const medicine = {
      id: 5,
      name: "Vitamin C",
      quantity: 25,
      minStock: 25,
      expiry: farFuture.toISOString().split('T')[0],
      category: "Vitamin"
    };
    expect(getStatus(medicine)).toBe("Low Stock");
  });

  test('TC_INV_007: Should return In Stock for good inventory', () => {
    const medicine = {
      id: 7,
      name: "Multivitamin",
      quantity: 100,
      minStock: 30,
      expiry: "2025-12-31",
      category: "Vitamin"
    };
    expect(getStatus(medicine)).toBe("In Stock");
  });

  // Add more tests for remaining test cases...
});
```

## Manual Testing Checklist

- [ ] Test with medicines expired 1 day ago
- [ ] Test with medicines expired 1 year ago
- [ ] Test with medicines expiring in 1 day
- [ ] Test with medicines expiring in 15 days
- [ ] Test with medicines expiring in 30 days
- [ ] Test with medicines expiring in 31 days
- [ ] Test with quantity = minStock
- [ ] Test with quantity < minStock
- [ ] Test with quantity > minStock
- [ ] Test with quantity = 0
- [ ] Test priority: Expired vs Low Stock
- [ ] Test priority: Near Expiry vs Low Stock
- [ ] Test with invalid dates
- [ ] Test with negative quantities
- [ ] Test with negative minStock values

## Expected Results Summary

| Test Case | Medicine Condition | Expected Status |
|-----------|-------------------|-----------------|
| TC_INV_001 | Expired | "Expired" |
| TC_INV_002 | Expires in 15 days | "Near Expiry" |
| TC_INV_003 | Expires in 30 days | "Near Expiry" |
| TC_INV_004 | Expires tomorrow | "Near Expiry" |
| TC_INV_005 | Quantity = minStock | "Low Stock" |
| TC_INV_006 | Quantity < minStock | "Low Stock" |
| TC_INV_007 | Good inventory | "In Stock" |
| TC_INV_008 | Expired + Low Stock | "Expired" |
| TC_INV_009 | Near Expiry + Low Stock | "Near Expiry" |
| TC_INV_010 | Expires today | "Expired" |
| TC_INV_011 | Expires in 31 days | "In Stock" |
| TC_INV_012 | Zero quantity | "Low Stock" |

## Notes
- The current logic uses 30 days as the threshold for "Near Expiry"
- Status priority: Expired > Near Expiry > Low Stock > In Stock
- Date calculations use `Math.ceil()` which rounds up to the nearest day
- All dates should be in YYYY-MM-DD format for consistency
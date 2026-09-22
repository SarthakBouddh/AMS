# AMS Update Review Summary

This branch contains the work completed for the asset-management feature update and review pass for the AMS application. The intent was to keep the existing product flow intact while adding the missing approval, audit, and inventory workflow pieces.

## 1. Request workflow and approval logic

### Problem addressed
The app needed a clear employee request lifecycle with manager approval and admin allocation. Previously, request state handling was inconsistent and there was no reliable audit trail for request actions.

### Files changed
- [backend/src/main/java/com/quantwork/ams/controller/RequestController.java](backend/src/main/java/com/quantwork/ams/controller/RequestController.java)
  - Added request creation approval flow for employees.
  - Added manager approval and rejection actions.
  - Added admin allocation flow.
  - Added role checks so the correct user type can act on a request.

- [backend/src/main/java/com/quantwork/ams/model/RequestItem.java](backend/src/main/java/com/quantwork/ams/model/RequestItem.java)
  - Extended request model to hold manager/admin states, status comments, and approval metadata.

- [backend/src/main/java/com/quantwork/ams/service/RequestItemService.java](backend/src/main/java/com/quantwork/ams/service/RequestItemService.java)
  - Added request initialization and lifecycle handling for approval states.

- [backend/src/main/java/com/quantwork/ams/repository/RequestItemRepository.java](backend/src/main/java/com/quantwork/ams/repository/RequestItemRepository.java)
  - Added request retrieval logic for employee-specific history and sorting support.

- [backend/src/main/java/com/quantwork/ams/config/DataSeeder.java](backend/src/main/java/com/quantwork/ams/config/DataSeeder.java)
  - Updated seeding values to reflect the current admin and default user setup.

## 2. Audit logging for asset and request actions

### Problem addressed
The system needed a record of who changed or approved what, especially around asset assignment and request actions.

### Files changed
- [backend/src/main/java/com/quantwork/ams/controller/AssetAuditLogController.java](backend/src/main/java/com/quantwork/ams/controller/AssetAuditLogController.java)
  - Added audit log API endpoints for asset history access.

- [backend/src/main/java/com/quantwork/ams/model/AssetAuditLog.java](backend/src/main/java/com/quantwork/ams/model/AssetAuditLog.java)
  - Added audit log model and metadata representation.

- [backend/src/main/java/com/quantwork/ams/repository/AssetAuditLogRepository.java](backend/src/main/java/com/quantwork/ams/repository/AssetAuditLogRepository.java)
  - Added repository support for log lookup and filtering.

- [backend/src/main/java/com/quantwork/ams/service/AssetAuditLogService.java](backend/src/main/java/com/quantwork/ams/service/AssetAuditLogService.java)
  - Added service logic to record and retrieve asset activity history.

- [backend/src/test/java/com/quantwork/ams/service/AssetAuditLogServiceTest.java](backend/src/test/java/com/quantwork/ams/service/AssetAuditLogServiceTest.java)
  - Added test coverage for audit log behavior.

## 3. Frontend authentication and routing cleanup

### Problem addressed
The front end needed to respect the current user role and keep employees away from admin-only screens while still showing tenant-scoped content properly.

### Files changed
- [frontend/src/App.jsx](frontend/src/App.jsx)
  - Added route checks for employee and super-admin screens.
  - Fixed navigation and redirect logic after login.
  - Scoped page loading to the current company context.

- [frontend/src/api.js](frontend/src/api.js)
  - Added API calls and login handling consistent with the backend request and asset endpoints.

- [frontend/src/components/LoginPage.jsx](frontend/src/components/LoginPage.jsx)
  - Updated login behavior to match the restored auth flow.

- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)
  - Adjusted visible nav items and role-based access.

- [frontend/src/main.jsx](frontend/src/main.jsx)
  - Updated app bootstrap flow to align with the current auth and route model.

## 4. Asset inventory and dashboard page updates

### Problem addressed
The user experience needed consistent inventory, overview, and admin actions across the app.

### Files changed
- [frontend/src/components/OverviewPage.jsx](frontend/src/components/OverviewPage.jsx)
  - Updated dashboard cards and role-based layout.

- [frontend/src/components/AssetInventoryPage.jsx](frontend/src/components/AssetInventoryPage.jsx)
  - Updated inventory behavior and visibility for company-scoped assets.

- [frontend/src/components/MaintenancePage.jsx](frontend/src/components/MaintenancePage.jsx)
  - Refined maintenance page access and asset maintenance handling.

- [frontend/src/components/ResourceBookingPage.jsx](frontend/src/components/ResourceBookingPage.jsx)
  - Updated resource booking flow to match the management workflow.

- [frontend/src/components/AuditTrailPage.jsx](frontend/src/components/AuditTrailPage.jsx)
  - Added or updated audit trail display and filtering.

## 5. Request page, filters, and approval UX

### Problem addressed
The request page needed better filtering, status handling, and action visibility for manager or admin review.

### Files changed
- [frontend/src/components/RequestsPage.jsx](frontend/src/components/RequestsPage.jsx)
  - Added request filtering, status handling, and action controls.
  - Updated approval and rejection UI experience.
  - Kept newest requests visible first.

## 6. Dependency update

### Files changed
- [frontend/package.json](frontend/package.json)
- [frontend/package-lock.json](frontend/package-lock.json)

These were updated for the front-end changes and the required UI/build compatibility needed during the feature update.

---

## Commit split recommendation

This branch is organized into review-friendly logical groups:

1. Backend request lifecycle and audit logging
2. Frontend auth and app routing
3. Inventory and dashboard page updates
4. Request workflow UI and filter changes
5. Review documentation and summary

This makes it easier for a reviewer to check the feature work and merge only the relevant update set.

# DevDash Development Tasks

## UI/Frontend
- [ ] Add sorting options to dashboard (name, date, priority, activity)
- [ ] Add project search with full-text capabilities
- [ ] Add keyboard shortcuts (j/k navigation, ? for help)
- [ ] Add breadcrumb navigation on project detail page
- [ ] Add mobile hamburger menu for sidebar access
- [ ] Add bulk selection and actions (multi-select projects/tasks)
- [ ] Add drag-drop to reorder projects on dashboard
- [ ] Add quick edit modal for tasks in Kanban view
- [ ] Add task count badges per status on project cards
- [ ] Add progress bar showing task completion percentage

## Backend/API
- [ ] Add JSON import functionality (pair with existing export)
- [ ] Add CSV export option for projects and tasks
- [ ] Add API endpoints for external integrations
- [ ] Add database backup/restore functionality
- [ ] Add full-text search indexing for large datasets

## Feature
- [ ] Add subtasks/nested task support
- [ ] Add task dependencies (blocking/blocked by)
- [ ] Add recurring tasks functionality
- [ ] Add task templates for common workflows
- [ ] Add project templates for quick setup
- [ ] Add project cloning/duplicate feature
- [ ] Add favorites/starred projects feature
- [ ] Add project folders/categories for organization
- [ ] Add time tracking (estimated vs actual hours)
- [ ] Add task attachments/file uploads

## DevOps/Deployment
- [ ] Add GitHub sync status indicator (last synced time)
- [ ] Add GitHub Issues integration
- [ ] Add webhook retry logic for failed syncs
- [ ] Add support for multiple GitHub repos per project
- [ ] Add conflict resolution for manual vs GitHub edits

## Documentation
- [ ] Add in-app tooltips and help text
- [ ] Add onboarding tutorial for new users
- [ ] Add keyboard shortcuts reference modal
- [ ] Add changelog/release notes page

## Bug Fix
- [ ] Fix task list view to use status field instead of completed boolean
- [ ] Fix Kanban card edit/delete buttons visibility on hover
- [ ] Ensure task status syncs with completed field consistently

## Testing
- [ ] Add unit tests for server actions
- [ ] Add integration tests for GitHub webhook
- [ ] Add E2E tests for critical user flows
- [ ] Add accessibility testing (WCAG compliance)

## Research
- [ ] Evaluate real-time sync options (WebSockets vs polling)
- [ ] Research offline-first architecture options
- [ ] Evaluate team/collaboration feature requirements
- [ ] Research integration options (Jira, Asana, Notion)

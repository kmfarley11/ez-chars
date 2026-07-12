## ADDED Requirements

### Requirement: OpenSpec change as execution source
Approved OpenSpec changes SHALL serve as the active execution source for all non-trivial engineering work.

#### Scenario: Working on a non-trivial feature or change
- **WHEN** a contributor (human or agent) starts work on a non-trivial change
- **THEN** they SHALL execute the work against an approved OpenSpec change workspace (`openspec/changes/<change-id>/`)

### Requirement: Backlog as prioritization queue
The MVP backlog SHALL serve as a prioritized candidate queue rather than the execution source for active work.

#### Scenario: Managing pending work
- **WHEN** reviewing or prioritizing upcoming tasks
- **THEN** the task details SHALL be referenced from the MVP backlog, but active task tracking for in-progress work SHALL occur in the respective OpenSpec change tasks

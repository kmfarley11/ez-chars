## ADDED Requirements

### Requirement: Protected local content receives a remote-model disclosure when controls are unknown

Before directly inspecting nonpublic, paid, rights-restricted, or personally sensitive local content, an agent that cannot verify the client or provider's transmission, retention, or training controls SHALL give the human a concise disclosure and request confirmation for the scoped task.

#### Scenario: Agent cannot verify provider data controls

- **WHEN** an agent is asked to inspect protected local content and cannot verify how selected content or tool output will be handled by the remote model service
- **THEN** it SHALL warn that the selected material may be transmitted to the provider and ask the human to confirm their settings and authorization before direct inspection
- **AND** it SHALL NOT claim that provider processing necessarily makes the content public or trains a public model

#### Scenario: Human accepts the scoped processing context

- **WHEN** the human confirms their settings, authorization, and acceptance for the current source-review task
- **THEN** the agent MAY proceed and SHALL NOT repeat the same disclosure during that scoped task unless the processing context materially changes

#### Scenario: Agent receives sanitized bibliographic metadata

- **WHEN** an agent receives only reviewed source identity, page/name citations, project-owned topics, and independently authored descriptions
- **THEN** it MAY process that sanitized metadata without issuing a new protected-source disclosure

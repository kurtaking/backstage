---
id: auditor
title: Auditing
description: Security event monitoring and audit trail observability in Backstage
---

Backstage provides comprehensive security observability through the [Auditor Service](../../backend-system/core-services/auditor.md), which enables security event monitoring, audit trail analysis, and compliance reporting.

## Overview

Security observability in Backstage focuses on monitoring security-relevant events, tracking user activities, and maintaining audit trails for compliance and incident response. The Auditor Service automatically captures security events with rich context including user identity, request details, and operation outcomes.

## Security Event Monitoring

### What Gets Monitored

The Auditor Service automatically captures security-relevant events such as:

- **Authentication events**: Login attempts, session management
- **Authorization changes**: Permission grants/revokes, role modifications
- **Data access**: Sensitive data retrieval, export operations
- **System changes**: Configuration modifications, administrative actions
- **Security incidents**: Failed operations, suspicious activities

### Event Severity Levels

Security events are categorized by severity to enable proper monitoring and alerting:

- **`low`**: Normal usage events (logged as debug by default)
- **`medium`**: Write operations, data access (logged as info by default)
- **`high`**: Permission changes, sensitive operations (logged as info by default)
- **`critical`**: Root-level changes, security incidents (logged as info by default)

### Event Structure

Each audit event includes the following information for monitoring and analysis:

```ts
type AuditorEvent = {
  plugin: string; // Plugin ID that created the event
  eventId: string; // Event identifier (e.g., "user-login", "permission-grant")
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  actor: {
    actorId?: string; // User identity
    ip?: string; // IP address
    hostname?: string; // Hostname
    userAgent?: string; // User agent string
  };
  request?: {
    url: string; // Request URL
    method: string; // HTTP method
  };
  meta?: JsonObject; // Additional metadata
  status: 'initiated' | 'succeeded' | 'failed';
  error?: Error; // Error details (if failed)
};
```

## Observability Integration

### Log-Based Monitoring

Audit events are automatically logged with the `isAuditEvent: true` field, enabling easy filtering and aggregation:

```bash
# Monitor all security events
grep "isAuditEvent.*true" backstage.logs

# Track high-severity events
grep "severityLevel.*high" backstage.logs

# Monitor authentication events
grep "eventId.*login" backstage.logs

# Monitor failed operations
grep "status.*failed" backstage.logs

# Track specific user activity
grep "actorId.*user:default/alice" backstage.logs
```

### Common Event Types

The following event types are commonly monitored for security observability:

- **`user-login`**: Authentication attempts and session management
- **`permission-grant`**: Permission changes and role modifications
- **`entity-fetch`**: Data access operations
- **`entity-mutate`**: Data modification operations
- **`file-download`**: File access and export operations
- **`system-config`**: Configuration changes and administrative actions

### Metrics and Alerting

Configure your monitoring system to track security metrics:

```yaml
# Prometheus alerting rules example
groups:
  - name: backstage-security
    rules:
      - alert: HighSeverityAuditEvents
        expr: increase(backstage_audit_events_total{severity="high"}[5m]) > 10
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: 'High volume of high-severity audit events'

      - alert: CriticalAuditEvents
        expr: increase(backstage_audit_events_total{severity="critical"}[5m]) > 0
        for: 0m
        labels:
          severity: critical
        annotations:
          summary: 'Critical security event detected'
```

### SIEM Integration

Configure log level mappings to optimize SIEM integration:

```yaml
backend:
  auditor:
    severityLogLevelMappings:
      low: debug # Filtered out by most SIEM systems
      medium: info # Standard monitoring level
      high: warn # SIEM alerting threshold
      critical: error # Immediate attention required
```

## Security Dashboards

### Key Metrics to Monitor

Create dashboards to track security observability metrics:

- **Authentication activity**: Login attempts, success/failure rates
- **Permission changes**: Grants, revokes, role modifications
- **Data access patterns**: Sensitive data access frequency
- **Security incidents**: Failed operations, suspicious activities
- **User activity**: Most active users, unusual patterns

## Compliance and Audit Reporting

### Audit Trail Analysis

The Auditor Service provides comprehensive audit trails for compliance requirements:

- **User activity tracking**: Complete history of user actions
- **Access control monitoring**: Permission changes and data access
- **Security incident investigation**: Detailed context for security events
- **Compliance reporting**: Automated generation of audit reports

### Compliance Frameworks

Backstage audit events support various compliance frameworks:

- **SOC 2**: User access monitoring, change management
- **GDPR**: Data access tracking, user consent management
- **HIPAA**: Protected health information access monitoring
- **SOX**: Financial data access and modification tracking

## Incident Response

### Security Event Investigation

When security incidents occur, audit events provide essential context:

```bash
# Investigate a specific user's activity
grep "actorId.*user:default/suspicious-user" backstage.logs

# Track a specific operation across time
grep "eventId.*permission-grant" backstage.logs | grep "2024-01-15"

# Analyze failed operations
grep "status.*failed" backstage.logs | grep "severityLevel.*high"
```

### Automated Response

Configure automated responses to security events:

```yaml
# Example: Alert on suspicious activity
alerts:
  - name: suspicious-login-pattern
    condition: 'multiple failed logins from same IP'
    action: 'block IP temporarily'

  - name: privilege-escalation
    condition: 'user granted admin permissions'
    action: 'require additional approval'
```

## Best Practices for Security Observability

### Event Granularity

- **Monitor security-relevant operations**: Authentication, authorization, data access
- **Avoid noise**: Don't log every database read, focus on sensitive operations
- **Include context**: Always capture relevant metadata for investigation

### Alerting Strategy

- **High-severity events**: Immediate alerts for critical security events
- **Pattern-based alerts**: Detect unusual activity patterns
- **False positive reduction**: Use appropriate thresholds and conditions

### Data Retention

- **Compliance requirements**: Retain audit logs according to regulatory requirements
- **Investigation needs**: Keep sufficient history for incident investigation
- **Storage optimization**: Consider log compression and archival strategies

### Privacy and Security

- **PII protection**: Avoid logging sensitive personal information
- **Log security**: Ensure audit logs are properly secured and access-controlled
- **Data minimization**: Only log necessary information for security monitoring

## Configuration for Observability

### Log Level Mappings

Configure how audit event severity levels map to log levels for optimal monitoring:

```yaml
backend:
  auditor:
    severityLogLevelMappings:
      low: debug # Filtered out by most monitoring systems
      medium: info # Standard monitoring level
      high: warn # Alerting threshold
      critical: error # Immediate attention required
```

### Default Mappings

By default, audit events are mapped as follows:

- `low`: `debug`
- `medium`: `info`
- `high`: `info`
- `critical`: `info`

### Monitoring Configuration

For production environments, consider these monitoring configurations:

```yaml
# Development: Capture all events
backend:
  auditor:
    severityLogLevelMappings:
      low: info
      medium: info
      high: warn
      critical: error

# Production: Focus on security-relevant events
backend:
  auditor:
    severityLogLevelMappings:
      low: debug      # Reduce noise
      medium: info    # Monitor data access
      high: warn      # Alert on permission changes
      critical: error # Immediate alerts
```

## Implementation

For implementation details, API usage, and service configuration, see the [Auditor Service documentation](../../backend-system/core-services/auditor.md).

# Technical Design Document: Real-Time Chat Feature

## Document Information
- **Document Version:** 1.0
- **Date:** 2026-02-12
- **Author:** Design Team
- **Status:** Draft

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Goals and Non-Goals](#goals-and-non-goals)
3. [Proposed Solution](#proposed-solution)
4. [System Architecture](#system-architecture)
5. [Component Breakdown](#component-breakdown)
6. [API Design](#api-design)
7. [Data Models](#data-models)
8. [Security Considerations](#security-considerations)
9. [Performance Requirements](#performance-requirements)
10. [Deployment Strategy](#deployment-strategy)
11. [Trade-offs and Alternatives](#trade-offs-and-alternatives)
12. [Success Metrics](#success-metrics)
13. [Implementation Timeline](#implementation-timeline)

---

## Problem Statement

### Context
The employee management system currently lacks real-time communication capabilities. Employees need to communicate instantly within the application for collaboration, support requests, and team coordination.

### Requirements
The real-time chat feature must support:
- **WebSocket-based communication** for bi-directional, low-latency messaging
- **Message persistence** in PostgreSQL for audit trails and history
- **10,000 concurrent users** with minimal performance degradation
- **End-to-end encryption (E2E)** to ensure message privacy and security

### Constraints
- Must integrate with existing employee management system
- Must work with the current Express.js backend
- Should leverage existing authentication mechanisms
- Must comply with enterprise security and data privacy requirements

---

## Goals and Non-Goals

### Goals
✅ Enable real-time text messaging between employees  
✅ Support one-to-one and group conversations  
✅ Persist all messages in PostgreSQL for compliance and auditing  
✅ Implement end-to-end encryption for message content  
✅ Scale to 10,000 concurrent WebSocket connections  
✅ Provide typing indicators and read receipts  
✅ Support message delivery confirmation  

### Non-Goals
❌ Video/audio calling (future phase)  
❌ File sharing beyond text (future phase)  
❌ Message translation (future phase)  
❌ AI-powered chatbots (future phase)  
❌ Third-party integrations (Slack, Teams, etc.)  

---

## Proposed Solution

### High-Level Overview
Implement a hybrid architecture that combines:
1. **WebSocket layer** (using Socket.IO) for real-time communication
2. **PostgreSQL database** migration from SQLite for message persistence and scalability
3. **E2E encryption** using Signal Protocol (libsignal)
4. **Redis** for session management and message queuing
5. **Horizontal scaling** with load balancers for high concurrency

### Technology Stack
- **WebSocket Library:** Socket.IO v4.x (with fallback to long-polling)
- **Database:** PostgreSQL 15+ (migration from current SQLite)
- **Caching/Pub-Sub:** Redis 7.x
- **Encryption:** @signalapp/libsignal-client for E2E encryption
- **Load Balancer:** Nginx or AWS ALB
- **Backend:** Express.js (existing) + Socket.IO
- **Frontend:** React (existing) + Socket.IO client

---

## System Architecture

### Overall Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[React App] --> B[Socket.IO Client]
        A --> C[E2E Encryption Module]
    end
    
    subgraph "Load Balancing Layer"
        D[Nginx/ALB]
    end
    
    subgraph "Application Layer - Multiple Instances"
        E1[Express Server 1<br/>+ Socket.IO]
        E2[Express Server 2<br/>+ Socket.IO]
        E3[Express Server N<br/>+ Socket.IO]
    end
    
    subgraph "Caching & Pub/Sub Layer"
        F[Redis Cluster]
        F1[Redis Primary]
        F2[Redis Replica 1]
        F3[Redis Replica 2]
    end
    
    subgraph "Data Layer"
        G[PostgreSQL Primary]
        H[PostgreSQL Standby]
    end
    
    B --> D
    D --> E1
    D --> E2
    D --> E3
    
    E1 --> F1
    E2 --> F1
    E3 --> F1
    
    F1 --> F2
    F1 --> F3
    
    E1 --> G
    E2 --> G
    E3 --> G
    
    G --> H
    
    style A fill:#e1f5ff
    style D fill:#fff4e1
    style F1 fill:#ffe1e1
    style G fill:#e1ffe1
```

### WebSocket Communication Flow

```mermaid
sequenceDiagram
    participant U1 as User 1 (Sender)
    participant C1 as Client 1
    participant LB as Load Balancer
    participant S1 as Server 1
    participant R as Redis
    participant S2 as Server 2
    participant C2 as Client 2
    participant U2 as User 2 (Recipient)
    participant DB as PostgreSQL
    
    U1->>C1: Type message
    C1->>C1: Encrypt message (E2E)
    C1->>LB: Send encrypted message
    LB->>S1: Route to Server 1
    S1->>DB: Persist encrypted message
    S1->>R: Publish message event
    R-->>S2: Notify Server 2
    S2->>C2: Deliver encrypted message
    C2->>C2: Decrypt message (E2E)
    C2->>U2: Display message
    C2->>S2: Send delivery receipt
    S2->>R: Publish receipt
    R-->>S1: Notify Server 1
    S1->>C1: Delivery confirmation
```

### Data Flow Architecture

```mermaid
flowchart LR
    subgraph "Client"
        A[User Input] --> B[E2E Encrypt]
        B --> C[WebSocket Send]
    end
    
    subgraph "Server"
        C --> D[Validate & Auth]
        D --> E[Store in DB]
        E --> F[Publish to Redis]
        F --> G[Broadcast to Recipients]
    end
    
    subgraph "Recipient"
        G --> H[WebSocket Receive]
        H --> I[E2E Decrypt]
        I --> J[Display Message]
    end
    
    style B fill:#ffcccc
    style I fill:#ffcccc
```

---

## Component Breakdown

### 1. Frontend Components

#### ChatContainer Component
**Responsibilities:**
- Main container for chat interface
- Manages WebSocket connection lifecycle
- Handles connection state (connected, disconnected, reconnecting)
- Dispatches events to child components

**Key Methods:**
```javascript
- initializeWebSocket()
- handleConnectionError()
- handleReconnection()
- cleanupConnection()
```

#### ConversationList Component
**Responsibilities:**
- Display list of active conversations
- Show unread message counts
- Sort conversations by last message timestamp
- Support search/filter functionality

#### MessageThread Component
**Responsibilities:**
- Display messages in a conversation
- Handle infinite scroll for message history
- Show typing indicators
- Render read receipts
- Display message timestamps

#### MessageInput Component
**Responsibilities:**
- Text input with emoji support
- Trigger typing indicators
- Handle message submission
- Support message drafts (localStorage)

#### EncryptionManager
**Responsibilities:**
- Initialize Signal Protocol client
- Manage encryption keys (identity, pre-keys, session keys)
- Encrypt outgoing messages
- Decrypt incoming messages
- Handle key rotation and rekeying

**Key Methods:**
```javascript
- generateKeyPair()
- encryptMessage(recipientId, plaintext)
- decryptMessage(senderId, ciphertext)
- rotatePreKeys()
```

### 2. Backend Components

#### WebSocket Server Module
**Responsibilities:**
- Initialize Socket.IO server
- Handle client connections/disconnections
- Authenticate WebSocket connections
- Route messages to appropriate handlers
- Manage connection pools

**Key Files:**
```
backend/src/websocket/
├── server.js           # Socket.IO initialization
├── handlers/
│   ├── connection.js   # Connection/disconnection logic
│   ├── message.js      # Message handling
│   └── presence.js     # Online/offline status
└── middleware/
    ├── auth.js         # WebSocket authentication
    └── rateLimit.js    # Rate limiting for messages
```

#### Message Service
**Responsibilities:**
- Business logic for message operations
- Validate message payloads
- Store messages in PostgreSQL
- Query message history
- Handle message deletion/editing

**Key Methods:**
```javascript
- createMessage(senderId, recipientId, encryptedContent)
- getMessageHistory(conversationId, limit, offset)
- markAsRead(messageId, userId)
- deleteMessage(messageId, userId)
```

#### Conversation Service
**Responsibilities:**
- Manage conversation metadata
- Create one-to-one and group conversations
- Add/remove participants
- Track conversation state

#### Presence Service
**Responsibilities:**
- Track user online/offline status
- Manage "last seen" timestamps
- Handle typing indicators
- Publish presence updates via Redis

#### Redis Pub/Sub Manager
**Responsibilities:**
- Publish message events across server instances
- Subscribe to message channels
- Handle sticky session routing
- Manage presence broadcasts

### 3. Database Components

#### Migration Scripts
**Responsibilities:**
- Migrate from SQLite to PostgreSQL
- Create new tables for chat feature
- Set up indexes for performance
- Handle data migration

#### Connection Pool Manager
**Responsibilities:**
- Manage PostgreSQL connection pools
- Handle connection failover to standby
- Monitor connection health

---

## API Design

### WebSocket Events

#### Client → Server Events

```javascript
// Connection
socket.emit('authenticate', { token: 'JWT_TOKEN' })

// Messaging
socket.emit('message:send', {
  conversationId: 'uuid',
  encryptedContent: 'base64_encrypted_data',
  metadata: {
    clientMessageId: 'uuid',
    timestamp: 1707735116000
  }
})

// Typing indicators
socket.emit('typing:start', { conversationId: 'uuid' })
socket.emit('typing:stop', { conversationId: 'uuid' })

// Read receipts
socket.emit('message:read', { messageId: 'uuid' })

// Presence
socket.emit('presence:update', { status: 'online' | 'away' | 'offline' })
```

#### Server → Client Events

```javascript
// Connection
socket.on('authenticated', { userId: 'uuid', sessionId: 'uuid' })
socket.on('error', { code: 'AUTH_FAILED', message: 'Invalid token' })

// Messaging
socket.on('message:new', {
  messageId: 'uuid',
  conversationId: 'uuid',
  senderId: 'uuid',
  encryptedContent: 'base64_encrypted_data',
  timestamp: 1707735116000
})

socket.on('message:delivered', {
  messageId: 'uuid',
  clientMessageId: 'uuid'
})

socket.on('message:read', {
  messageId: 'uuid',
  readBy: 'uuid',
  timestamp: 1707735116000
})

// Typing indicators
socket.on('typing:user', {
  conversationId: 'uuid',
  userId: 'uuid',
  isTyping: true
})

// Presence
socket.on('presence:update', {
  userId: 'uuid',
  status: 'online' | 'away' | 'offline',
  lastSeen: 1707735116000
})
```

### REST API Endpoints

```javascript
// Conversation Management
GET    /api/v1/conversations
GET    /api/v1/conversations/:id
POST   /api/v1/conversations
DELETE /api/v1/conversations/:id
POST   /api/v1/conversations/:id/participants
DELETE /api/v1/conversations/:id/participants/:userId

// Message History (for initial load and pagination)
GET    /api/v1/conversations/:id/messages?limit=50&offset=0
GET    /api/v1/messages/:id

// Key Exchange (for E2E encryption)
GET    /api/v1/users/:id/keys/prekey
POST   /api/v1/users/keys/prekey
POST   /api/v1/users/keys/identity
```

### Request/Response Examples

#### Create Conversation
```http
POST /api/v1/conversations
Content-Type: application/json
Authorization: Bearer JWT_TOKEN

{
  "participantIds": ["user-uuid-1", "user-uuid-2"],
  "type": "direct" | "group",
  "name": "Team Discussion" // optional, for group chats
}

Response 201:
{
  "conversationId": "conv-uuid",
  "participants": [...],
  "createdAt": "2026-02-12T10:11:56Z"
}
```

#### Get Message History
```http
GET /api/v1/conversations/conv-uuid/messages?limit=50&offset=0
Authorization: Bearer JWT_TOKEN

Response 200:
{
  "messages": [
    {
      "messageId": "msg-uuid",
      "senderId": "user-uuid",
      "encryptedContent": "base64_data",
      "timestamp": "2026-02-12T10:11:56Z",
      "status": "delivered"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1247
  }
}
```

---

## Data Models

### PostgreSQL Schema

```sql
-- Conversations Table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
    name VARCHAR(255), -- NULL for direct chats
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB -- For extensibility
);

CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- Conversation Participants
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL, -- References existing employees table
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL, -- References existing employees table
    encrypted_content TEXT NOT NULL, -- Base64 encoded encrypted message
    client_message_id UUID, -- For deduplication
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
    metadata JSONB, -- For read receipts, delivery status, etc.
    UNIQUE(client_message_id)
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_client_id ON messages(client_message_id);

-- User Encryption Keys (for E2E encryption)
CREATE TABLE user_encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL UNIQUE, -- References existing employees table
    identity_key TEXT NOT NULL, -- Public identity key
    signed_pre_key TEXT NOT NULL,
    pre_key_signature TEXT NOT NULL,
    one_time_pre_keys JSONB, -- Array of one-time pre-keys
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_encryption_keys_user ON user_encryption_keys(user_id);

-- Message Read Receipts
CREATE TABLE message_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE INDEX idx_receipts_message ON message_receipts(message_id);
CREATE INDEX idx_receipts_user ON message_receipts(user_id);
```

### Redis Data Structures

```redis
# User presence (Hash)
user:presence:{userId}
  status: "online" | "away" | "offline"
  lastSeen: timestamp
  socketId: "socket-connection-id"

# Typing indicators (Set with TTL)
typing:{conversationId}
  userId1, userId2, ... (expires after 5 seconds)

# WebSocket session mapping
socket:session:{socketId}
  userId: integer
  connectedAt: timestamp

# Message queue (List for buffering)
queue:messages:{userId}
  [message1, message2, ...] (for offline users)

# Rate limiting (String with TTL)
ratelimit:{userId}:messages
  count: integer (expires after 1 minute)
```

### Data Model Relationships

```mermaid
erDiagram
    EMPLOYEES ||--o{ CONVERSATION_PARTICIPANTS : participates
    EMPLOYEES ||--o{ MESSAGES : sends
    EMPLOYEES ||--|| USER_ENCRYPTION_KEYS : has
    CONVERSATIONS ||--o{ CONVERSATION_PARTICIPANTS : contains
    CONVERSATIONS ||--o{ MESSAGES : contains
    MESSAGES ||--o{ MESSAGE_RECEIPTS : has
    EMPLOYEES ||--o{ MESSAGE_RECEIPTS : reads
    
    CONVERSATIONS {
        uuid id PK
        varchar type
        varchar name
        timestamp created_at
        timestamp updated_at
        jsonb metadata
    }
    
    CONVERSATION_PARTICIPANTS {
        uuid id PK
        uuid conversation_id FK
        int user_id FK
        timestamp joined_at
        timestamp last_read_at
        varchar role
    }
    
    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        int sender_id FK
        text encrypted_content
        uuid client_message_id
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
        jsonb metadata
    }
    
    USER_ENCRYPTION_KEYS {
        uuid id PK
        int user_id FK
        text identity_key
        text signed_pre_key
        text pre_key_signature
        jsonb one_time_pre_keys
        timestamp created_at
        timestamp updated_at
    }
    
    MESSAGE_RECEIPTS {
        uuid id PK
        uuid message_id FK
        int user_id FK
        timestamp read_at
    }
```

---

## Security Considerations

### 1. End-to-End Encryption (E2E)

#### Implementation: Signal Protocol
- **Identity Keys:** Each user has a long-term identity key pair (public/private)
- **Pre-keys:** Users upload signed pre-keys and one-time pre-keys to server
- **Session Keys:** Unique session keys for each conversation using Double Ratchet Algorithm
- **Forward Secrecy:** Old messages cannot be decrypted even if current keys are compromised
- **Deniability:** Message authentication without non-repudiation

#### Key Exchange Flow
```mermaid
sequenceDiagram
    participant A as User A
    participant S as Server
    participant B as User B
    
    Note over A: Generate identity<br/>and pre-keys
    A->>S: Upload public keys
    Note over B: Generate identity<br/>and pre-keys
    B->>S: Upload public keys
    
    Note over A: Wants to message B
    A->>S: Request B's pre-key bundle
    S->>A: Return pre-key bundle
    Note over A: Initialize session<br/>with B's keys
    A->>S: Send encrypted message
    S->>B: Deliver encrypted message
    Note over B: Decrypt with session key
```

#### Encryption Workflow
1. **Initial Setup:**
   - User generates identity key pair on device
   - User generates and uploads signed pre-keys and one-time pre-keys
   - Keys stored in `user_encryption_keys` table

2. **Starting a Conversation:**
   - Sender retrieves recipient's pre-key bundle from server
   - Sender initializes X3DH (Extended Triple Diffie-Hellman) key agreement
   - Sender derives shared secret and initial chain key

3. **Sending Messages:**
   - Encrypt message content with AES-256-GCM using message key
   - Derive message key from chain key using Double Ratchet
   - Send encrypted payload via WebSocket
   - Server stores encrypted content (cannot decrypt)

4. **Receiving Messages:**
   - Receive encrypted payload via WebSocket
   - Decrypt using session's current chain key
   - Update ratchet state for forward secrecy

#### Security Properties
✅ **Confidentiality:** Only sender and recipient can read messages  
✅ **Forward Secrecy:** Compromised keys don't expose past messages  
✅ **Break-in Recovery:** System recovers from key compromise  
✅ **Authentication:** Verify sender identity with public keys  
✅ **Integrity:** Detect message tampering with HMAC  

### 2. Authentication & Authorization

#### WebSocket Authentication
```javascript
// Client sends JWT token on connection
io.on('connection', async (socket) => {
  const token = socket.handshake.auth.token;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.join(`user:${decoded.userId}`);
  } catch (error) {
    socket.emit('error', { code: 'AUTH_FAILED' });
    socket.disconnect(true);
  }
});
```

#### Message Authorization
- Verify sender is participant in conversation
- Check participant has not been removed
- Validate message rate limits (prevent spam)

#### Access Control
```javascript
// Check user can access conversation
async function canAccessConversation(userId, conversationId) {
  const participant = await db.query(
    'SELECT 1 FROM conversation_participants WHERE user_id = $1 AND conversation_id = $2',
    [userId, conversationId]
  );
  return participant.rows.length > 0;
}
```

### 3. Additional Security Measures

#### Rate Limiting
- **Per-user message limit:** 100 messages per minute
- **Connection limit:** 3 concurrent connections per user
- **API rate limiting:** Existing 100 requests per 15 minutes applies

#### Input Validation
- Validate all WebSocket event payloads with JSON schema
- Sanitize user inputs to prevent XSS
- Limit message length (e.g., 10,000 characters)

#### HTTPS/WSS Only
- Enforce TLS 1.3 for all connections
- Use WSS (WebSocket Secure) protocol
- Implement HSTS headers

#### SQL Injection Prevention
- Use parameterized queries exclusively
- Never concatenate user input into SQL

#### XSS Prevention
- Sanitize message content before rendering
- Use React's built-in XSS protection
- Implement Content Security Policy (CSP) headers

#### CSRF Protection
- Use anti-CSRF tokens for REST endpoints
- Validate Origin header for WebSocket connections

#### Audit Logging
```javascript
// Log all security-relevant events
audit.log({
  event: 'MESSAGE_SENT',
  userId: sender.id,
  conversationId: conv.id,
  timestamp: Date.now(),
  ipAddress: socket.handshake.address,
  metadata: { messageId, encrypted: true }
});
```

---

## Performance Requirements

### Target Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Concurrent WebSocket Connections | 10,000 | Load testing |
| Message Delivery Latency (p95) | < 100ms | Real-time monitoring |
| Message Delivery Latency (p99) | < 200ms | Real-time monitoring |
| Database Query Response (p95) | < 50ms | APM tools |
| WebSocket Connection Time | < 2s | Client metrics |
| Message Throughput | 50,000 msgs/min | Load testing |
| System Uptime | 99.9% | Monitoring |

### Scalability Strategy

#### Horizontal Scaling
```mermaid
graph TB
    subgraph "Auto-Scaling Group"
        A[Server 1<br/>Connections: 2000]
        B[Server 2<br/>Connections: 2000]
        C[Server 3<br/>Connections: 2000]
        D[Server N<br/>Connections: 2000]
    end
    
    E[Load Balancer<br/>Sticky Sessions] --> A
    E --> B
    E --> C
    E --> D
    
    A --> F[Redis Cluster]
    B --> F
    C --> F
    D --> F
    
    A --> G[PostgreSQL Primary]
    B --> G
    C --> G
    D --> G
```

**Scaling Rules:**
- **Scale up:** When average connections per server > 1,500
- **Scale down:** When average connections per server < 500
- **Min instances:** 2 (for high availability)
- **Max instances:** 10 (10,000 / 1,000 connections per server)

#### Vertical Scaling Guidelines
**Application Servers:**
- CPU: 4-8 cores
- RAM: 8-16 GB
- Network: 1 Gbps

**PostgreSQL:**
- CPU: 8-16 cores
- RAM: 32-64 GB
- Storage: SSD with 10,000+ IOPS

**Redis:**
- CPU: 4-8 cores
- RAM: 16-32 GB
- Network: Low latency essential

### Performance Optimizations

#### 1. Database Optimization
```sql
-- Partitioning messages table by date
CREATE TABLE messages_2026_02 PARTITION OF messages
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_messages_conversation_created 
    ON messages(conversation_id, created_at DESC) 
    WHERE deleted_at IS NULL;

-- Read replica for message history queries
-- Write to primary, read from replica
```

#### 2. Caching Strategy
```javascript
// Cache conversation metadata in Redis
const conversation = await redis.get(`conv:${conversationId}`);
if (!conversation) {
  conversation = await db.getConversation(conversationId);
  await redis.setex(`conv:${conversationId}`, 3600, JSON.stringify(conversation));
}

// Cache user presence
await redis.setex(`presence:${userId}`, 300, JSON.stringify({ status, lastSeen }));
```

#### 3. Message Batching
```javascript
// Batch database writes for message receipts
const receiptQueue = [];

socket.on('message:read', async ({ messageId }) => {
  receiptQueue.push({ messageId, userId, timestamp: Date.now() });
  
  if (receiptQueue.length >= 100) {
    await db.batchInsertReceipts(receiptQueue);
    receiptQueue.length = 0;
  }
});
```

#### 4. Connection Optimization
```javascript
// Socket.IO configuration for performance
const io = new Server(server, {
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6, // 1MB
  perMessageDeflate: {
    threshold: 1024 // Only compress messages > 1KB
  }
});
```

#### 5. Lazy Loading
- Load only recent 50 messages initially
- Implement infinite scroll with pagination
- Lazy load conversation list (virtual scrolling)

### Load Testing Plan
```javascript
// Artillery load test configuration
{
  "config": {
    "target": "wss://chat.example.com",
    "phases": [
      { "duration": 300, "arrivalRate": 20, "name": "Ramp up" },
      { "duration": 600, "arrivalRate": 100, "name": "Sustained load" },
      { "duration": 300, "arrivalRate": 200, "name": "Peak load" }
    ],
    "socketio": {
      "path": "/socket.io",
      "transports": ["websocket"]
    }
  },
  "scenarios": [
    {
      "name": "Send and receive messages",
      "engine": "socketio",
      "flow": [
        { "emit": { "channel": "authenticate", "data": "{{token}}" }},
        { "think": 2 },
        { "emit": { "channel": "message:send", "data": {...} }},
        { "think": 5 }
      ]
    }
  ]
}
```

---

## Deployment Strategy

### Phase 1: Infrastructure Setup (Week 1-2)

#### Database Migration
```bash
# 1. Set up PostgreSQL cluster
# 2. Run migration scripts to create tables
npm run migrate:chat

# 3. Set up read replicas for scalability
# 4. Configure backup and restore procedures
```

#### Redis Deployment
```bash
# 1. Deploy Redis cluster (3 nodes minimum)
# 2. Enable persistence (AOF + RDB)
# 3. Configure sentinel for automatic failover
# 4. Test pub/sub functionality
```

#### Application Updates
```bash
# 1. Update backend dependencies
npm install socket.io@4.6.1 ioredis@5.3.2 pg@8.11.3 @signalapp/libsignal-client@0.32.0

# 2. Update frontend dependencies
npm install socket.io-client@4.6.1 @signalapp/libsignal-client@0.32.0

# 3. Configure environment variables
```

### Phase 2: Backend Deployment (Week 3)

#### Deployment Architecture
```mermaid
graph LR
    A[GitHub] -->|Push| B[CI/CD Pipeline]
    B -->|Build| C[Docker Image]
    C -->|Push| D[Container Registry]
    D -->|Pull| E[Kubernetes/ECS]
    E --> F[Server Pod 1]
    E --> G[Server Pod 2]
    E --> H[Server Pod N]
```

#### Deployment Steps
1. **Build Docker Image**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --production
   COPY . .
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Deploy to Kubernetes**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: chat-backend
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: chat-backend
     template:
       metadata:
         labels:
           app: chat-backend
       spec:
         containers:
         - name: backend
           image: chat-backend:latest
           ports:
           - containerPort: 3000
           env:
           - name: REDIS_URL
             valueFrom:
               secretKeyRef:
                 name: chat-secrets
                 key: redis-url
           - name: DATABASE_URL
             valueFrom:
               secretKeyRef:
                 name: chat-secrets
                 key: database-url
           resources:
             requests:
               memory: "2Gi"
               cpu: "1000m"
             limits:
               memory: "4Gi"
               cpu: "2000m"
   ```

3. **Load Balancer Configuration**
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: chat-backend-lb
   spec:
     type: LoadBalancer
     selector:
       app: chat-backend
     ports:
     - protocol: TCP
       port: 80
       targetPort: 3000
     sessionAffinity: ClientIP  # Sticky sessions for WebSocket
   ```

### Phase 3: Frontend Deployment (Week 3)

1. **Build optimized production bundle**
   ```bash
   npm run build
   ```

2. **Deploy to CDN**
   - Upload static assets to S3 or CDN
   - Configure CloudFront for caching
   - Set appropriate cache headers

### Phase 4: Monitoring & Observability (Week 4)

#### Monitoring Stack
```mermaid
graph TB
    A[Application] --> B[Metrics Collector]
    A --> C[Log Aggregator]
    A --> D[Trace Collector]
    
    B --> E[Prometheus]
    C --> F[ELK Stack]
    D --> G[Jaeger]
    
    E --> H[Grafana]
    F --> H
    G --> H
    
    H --> I[Alert Manager]
    I --> J[PagerDuty/Slack]
```

#### Key Metrics to Monitor
1. **WebSocket Metrics:**
   - Active connections count
   - Connection duration
   - Messages sent/received per second
   - Failed connection attempts

2. **Application Metrics:**
   - Request latency (p50, p95, p99)
   - Error rate
   - CPU and memory usage
   - Database connection pool utilization

3. **Database Metrics:**
   - Query execution time
   - Slow query count
   - Connection count
   - Replication lag

4. **Redis Metrics:**
   - Pub/sub messages per second
   - Memory usage
   - Eviction rate
   - Hit rate

#### Logging Strategy
```javascript
// Structured logging with Winston
logger.info('Message sent', {
  messageId,
  conversationId,
  senderId,
  timestamp: Date.now(),
  latency: Date.now() - startTime
});

logger.error('Message delivery failed', {
  messageId,
  error: error.message,
  stack: error.stack
});
```

#### Alerting Rules
- WebSocket connection failures > 5% → Page on-call
- Message delivery latency p95 > 500ms → Alert team
- Database connection pool > 80% → Auto-scale
- Redis memory > 90% → Alert team

### Phase 5: Gradual Rollout (Week 5-6)

#### Blue-Green Deployment
```mermaid
graph TB
    A[Load Balancer] --> B[Blue Environment<br/>Old Version]
    A -.->|Switch| C[Green Environment<br/>New Version]
    
    D[Monitor Metrics] --> E{Healthy?}
    E -->|Yes| F[Full Cutover]
    E -->|No| G[Rollback to Blue]
```

#### Rollout Plan
1. **Internal Testing (10% traffic):** Week 5, Day 1-2
2. **Beta Users (25% traffic):** Week 5, Day 3-5
3. **Partial Rollout (50% traffic):** Week 6, Day 1-2
4. **Full Rollout (100% traffic):** Week 6, Day 3-5

#### Rollback Strategy
- Keep previous version running in blue environment
- Monitor error rates and latency
- Rollback criteria:
  - Error rate > 1%
  - p95 latency > 1 second
  - WebSocket connection failures > 10%

### Environment Configuration

```bash
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@postgres-primary:5432/chatdb
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://redis-cluster:6379
REDIS_CLUSTER_NODES=redis1:6379,redis2:6379,redis3:6379

# WebSocket
SOCKET_IO_ADAPTER=redis
SOCKET_IO_CORS_ORIGIN=https://app.example.com

# Security
JWT_SECRET=<strong-secret-from-vault>
ENCRYPTION_KEY_ROTATION_DAYS=90

# Monitoring
SENTRY_DSN=https://...
DATADOG_API_KEY=<api-key>

# Feature Flags
FEATURE_E2E_ENCRYPTION=true
FEATURE_GROUP_CHAT=true
FEATURE_READ_RECEIPTS=true
```

---

## Trade-offs and Alternatives

### 1. WebSocket Library Choice

#### Selected: Socket.IO
**Pros:**
✅ Built-in reconnection logic  
✅ Fallback to long-polling for older browsers  
✅ Room-based broadcasting simplifies implementation  
✅ Large community and ecosystem  
✅ Redis adapter for horizontal scaling  

**Cons:**
❌ Slightly higher overhead than raw WebSocket  
❌ Custom protocol (not standard WebSocket)  

#### Alternative: Native WebSocket + ws library
**Pros:**
- Lower overhead
- Standard protocol
- More control

**Cons:**
- Must implement reconnection logic manually
- No fallback mechanism
- More complex horizontal scaling

**Decision:** Socket.IO chosen for faster development and built-in features.

---

### 2. Encryption Approach

#### Selected: Signal Protocol (E2E Encryption)
**Pros:**
✅ Industry-standard protocol (WhatsApp, Signal)  
✅ Forward secrecy and break-in recovery  
✅ Strong security guarantees  
✅ Well-audited implementation  

**Cons:**
❌ Complex key management  
❌ Cannot search encrypted messages on server  
❌ Initial key exchange adds latency  
❌ Mobile clients need crypto libraries  

#### Alternative: TLS-only (Transport Layer Security)
**Pros:**
- Simpler implementation
- Server can search messages
- Full-text search capabilities
- Lower latency

**Cons:**
- Server can read all messages (compliance risk)
- Single point of compromise
- Less privacy for users

**Decision:** Signal Protocol chosen for maximum privacy and compliance with enterprise security requirements.

---

### 3. Database Choice

#### Selected: PostgreSQL
**Pros:**
✅ ACID compliance for message integrity  
✅ Better scalability than SQLite  
✅ Advanced indexing (GiST, GIN)  
✅ Partitioning support for large tables  
✅ JSON support for metadata  
✅ Strong ecosystem and tooling  

**Cons:**
❌ Migration required from SQLite  
❌ More complex operations  
❌ Higher infrastructure cost  

#### Alternative: Keep SQLite
**Pros:**
- No migration needed
- Simple operations
- Zero configuration

**Cons:**
- Cannot handle 10,000 concurrent connections
- Limited scalability
- No read replicas
- Not suitable for production at scale

**Decision:** PostgreSQL required to meet 10K concurrent user requirement.

---

### 4. Caching/Pub-Sub Solution

#### Selected: Redis
**Pros:**
✅ Fast pub/sub for message broadcasting  
✅ Built-in data structures (hash, set, list)  
✅ TTL support for presence and typing indicators  
✅ Cluster mode for high availability  
✅ Socket.IO Redis adapter available  

**Cons:**
❌ Additional infrastructure component  
❌ Memory-based (data loss if not configured)  
❌ Cost of running cluster  

#### Alternative: PostgreSQL LISTEN/NOTIFY
**Pros:**
- No additional infrastructure
- Persistent storage
- Lower cost

**Cons:**
- Not designed for high-frequency pub/sub
- Limited scalability
- No TTL support
- No data structure support

**Decision:** Redis chosen for superior pub/sub performance and built-in Socket.IO support.

---

### 5. Message Storage Strategy

#### Selected: Store Encrypted Messages
**Pros:**
✅ Compliance with privacy regulations  
✅ Audit trail preserved  
✅ Message history available  
✅ Search on metadata (sender, timestamp)  

**Cons:**
❌ Cannot full-text search message content  
❌ Higher storage costs  
❌ Complex key rotation  

#### Alternative: Ephemeral Messages (No Storage)
**Pros:**
- Lower storage costs
- Better privacy
- Simpler implementation

**Cons:**
- No message history
- Compliance issues for enterprises
- Poor user experience

**Decision:** Store encrypted messages for enterprise compliance and user expectations.

---

### 6. Horizontal Scaling Approach

#### Selected: Sticky Sessions + Redis Pub/Sub
**Pros:**
✅ Simple implementation  
✅ Client stays connected to same server  
✅ Redis handles cross-server messaging  
✅ Works well with Socket.IO  

**Cons:**
❌ Uneven load if users connect at different times  
❌ Server failure affects all its users  

#### Alternative: Server-less Architecture (AWS IoT Core, Pusher)
**Pros:**
- No server management
- Automatic scaling
- Built-in reliability

**Cons:**
- Vendor lock-in
- Higher costs at scale
- Less control over infrastructure
- E2E encryption complexity

**Decision:** Self-hosted with sticky sessions for cost control and flexibility.

---

## Success Metrics

### Key Performance Indicators (KPIs)

#### 1. Technical Metrics
| Metric | Target | Tracking Method |
|--------|--------|----------------|
| **Message Delivery Success Rate** | > 99.9% | Application logs |
| **Average Message Latency (p95)** | < 100ms | APM (Datadog/New Relic) |
| **WebSocket Connection Success** | > 99% | Client-side metrics |
| **System Uptime** | > 99.9% | Uptime monitoring |
| **Concurrent Users Supported** | 10,000+ | Load testing + production monitoring |
| **Database Query Performance (p95)** | < 50ms | PostgreSQL slow query log |
| **Encryption Overhead** | < 20ms per message | Performance profiling |

#### 2. User Engagement Metrics
| Metric | Target | Tracking Method |
|--------|--------|----------------|
| **Daily Active Users (DAU)** | 60% of total users | Analytics |
| **Average Messages per User per Day** | 15+ | Database queries |
| **Conversation Engagement Rate** | 70%+ | Analytics |
| **Average Session Duration** | 10+ minutes | Client-side tracking |
| **Retention Rate (Day 7)** | 80%+ | Cohort analysis |

#### 3. Security Metrics
| Metric | Target | Tracking Method |
|--------|--------|----------------|
| **E2E Encryption Coverage** | 100% of messages | Application logs |
| **Failed Authentication Attempts** | < 0.1% | Security logs |
| **Key Rotation Compliance** | 100% within 90 days | Automated checks |
| **Security Incidents** | 0 | Incident reports |
| **Audit Log Completeness** | 100% | Automated validation |

#### 4. Reliability Metrics
| Metric | Target | Tracking Method |
|--------|--------|----------------|
| **Mean Time to Recovery (MTTR)** | < 15 minutes | Incident tracking |
| **Mean Time Between Failures (MTBF)** | > 720 hours (30 days) | Incident tracking |
| **Deployment Success Rate** | > 95% | CI/CD metrics |
| **Rollback Rate** | < 5% | Deployment tracking |

### Monitoring Dashboards

#### Real-Time Dashboard
```
┌─────────────────────────────────────────────────────┐
│ Chat System Health                                  │
├─────────────────────────────────────────────────────┤
│ Active Connections:    8,742 / 10,000              │
│ Messages/sec:          847                          │
│ Avg Latency (p95):     78ms                        │
│ Error Rate:            0.02%                        │
│                                                      │
│ Server Health:         ████████░░ 80%               │
│ Database Load:         ██████░░░░ 60%               │
│ Redis Memory:          ███████░░░ 70%               │
└─────────────────────────────────────────────────────┘
```

#### Weekly Report Metrics
- Total messages sent
- Peak concurrent users
- Average latency trends
- Error rate trends
- User engagement statistics

### Success Criteria (Go/No-Go for Production)

✅ **Must Have (Blockers):**
- [ ] All security tests pass (E2E encryption working)
- [ ] Load test successfully handles 10,000 concurrent users
- [ ] Message delivery success rate > 99.9% in staging
- [ ] Zero critical security vulnerabilities
- [ ] Database failover tested and working
- [ ] Monitoring and alerting configured

⚠️ **Should Have (Launch with Mitigation):**
- [ ] p95 latency < 100ms (can launch if < 200ms with plan)
- [ ] Full documentation complete (can launch with partial)
- [ ] All automated tests passing (can launch with manual testing)

🔄 **Nice to Have (Post-Launch):**
- [ ] Group chat functionality
- [ ] Message search
- [ ] Push notifications
- [ ] Mobile app support

---

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
**Week 1:**
- [ ] Set up PostgreSQL cluster (primary + replica)
- [ ] Deploy Redis cluster
- [ ] Create database schema and run migrations
- [ ] Set up development environment with new dependencies

**Week 2:**
- [ ] Implement basic WebSocket server with Socket.IO
- [ ] Implement authentication middleware for WebSocket
- [ ] Create REST API endpoints for conversations
- [ ] Set up Redis pub/sub for cross-server messaging

### Phase 2: Core Features (Weeks 3-4)
**Week 3:**
- [ ] Implement E2E encryption (Signal Protocol integration)
- [ ] Create key exchange endpoints
- [ ] Implement message sending/receiving logic
- [ ] Store encrypted messages in PostgreSQL

**Week 4:**
- [ ] Build React chat UI components
- [ ] Implement message history loading with pagination
- [ ] Add typing indicators
- [ ] Add read receipts

### Phase 3: Scale & Performance (Weeks 5-6)
**Week 5:**
- [ ] Optimize database queries and add indexes
- [ ] Implement connection pooling
- [ ] Set up horizontal scaling with load balancer
- [ ] Conduct load testing (target: 10K concurrent users)

**Week 6:**
- [ ] Performance tuning based on load test results
- [ ] Implement caching strategies
- [ ] Optimize WebSocket message handling
- [ ] Second round of load testing

### Phase 4: Security & Monitoring (Week 7)
- [ ] Security audit of E2E encryption implementation
- [ ] Penetration testing
- [ ] Set up comprehensive monitoring dashboards
- [ ] Configure alerting rules
- [ ] Create runbooks for common incidents

### Phase 5: Testing & QA (Week 8)
- [ ] Integration testing
- [ ] End-to-end testing
- [ ] User acceptance testing (UAT)
- [ ] Performance regression testing
- [ ] Security verification

### Phase 6: Deployment (Weeks 9-10)
**Week 9:**
- [ ] Production infrastructure setup
- [ ] Deploy to production (blue-green)
- [ ] Internal testing (10% rollout)
- [ ] Beta user testing (25% rollout)

**Week 10:**
- [ ] Gradual rollout to 50% users
- [ ] Monitor metrics and user feedback
- [ ] Full rollout to 100% users
- [ ] Post-launch monitoring

### Phase 7: Post-Launch (Week 11+)
- [ ] Address user feedback
- [ ] Performance optimization
- [ ] Plan Phase 2 features (group chat, file sharing)

---

## Appendix

### A. Glossary
- **E2E Encryption:** End-to-End Encryption where only sender and recipient can decrypt messages
- **WebSocket:** Protocol for bi-directional communication between client and server
- **Pub/Sub:** Publish-Subscribe messaging pattern
- **Double Ratchet:** Cryptographic algorithm providing forward secrecy and break-in recovery
- **X3DH:** Extended Triple Diffie-Hellman key agreement protocol
- **Pre-key:** Public key uploaded in advance for asynchronous communication

### B. References
1. Signal Protocol Documentation: https://signal.org/docs/
2. Socket.IO Documentation: https://socket.io/docs/
3. PostgreSQL Performance Tuning: https://wiki.postgresql.org/wiki/Performance_Optimization
4. WebSocket RFC 6455: https://tools.ietf.org/html/rfc6455
5. OWASP WebSocket Security: https://owasp.org/www-community/vulnerabilities/WebSocket

### C. Dependencies

#### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1",
    "pg": "^8.11.3",
    "ioredis": "^5.3.2",
    "@signalapp/libsignal-client": "^0.32.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1"
  }
}
```

#### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "socket.io-client": "^4.6.1",
    "@signalapp/libsignal-client": "^0.32.0",
    "axios": "^1.6.2"
  }
}
```

### D. Team Responsibilities
- **Backend Team:** WebSocket server, API endpoints, database schema
- **Frontend Team:** Chat UI, encryption integration, state management
- **DevOps Team:** Infrastructure, deployment, monitoring
- **Security Team:** Security audit, penetration testing, compliance
- **QA Team:** Testing strategy, load testing, UAT

---

## Document Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | TBD | TBD | |
| Product Manager | TBD | TBD | |
| Security Lead | TBD | TBD | |
| DevOps Lead | TBD | TBD | |

---

**Next Steps:**
1. Review and approve this design document
2. Allocate resources and team members
3. Set up project tracking (Jira/GitHub Issues)
4. Begin Phase 1 implementation
5. Schedule weekly sync meetings

**Questions or Feedback:**
Please submit comments to this document or contact the design team.

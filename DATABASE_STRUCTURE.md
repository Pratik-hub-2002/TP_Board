# TP Board Database Structure

## 🔥 Database Type: Firebase Firestore (NoSQL)

**Firestore is a NoSQL document database** that stores data in collections and documents, not tables like MySQL.

## 📊 Current Database Collections & Documents

### **Collection Structure:**
```
/users/{userId}/                          # User document
├── boards/{boardId}/                     # Board documents (subcollection)
│   ├── name: string
│   ├── owner: string  
│   ├── ownerEmail: string
│   ├── members: object
│   ├── isPublic: boolean
│   ├── settings: object
│   ├── tabs: object                      # Your current lists structure
│   ├── tasks: object                     # Your current tasks structure
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
└── notifications/{notificationId}/       # User notifications (subcollection)
```

### **What Collections Are Actually Created:**

1. **`users` Collection** - Top-level collection
   - Document ID: Firebase Auth UID
   - Contains user profile data

2. **`users/{userId}/boards` Subcollection** - User's boards
   - Document ID: Auto-generated board ID
   - Contains board metadata, lists (tabs), and tasks

3. **`users/{userId}/notifications` Subcollection** - User notifications
   - Document ID: Auto-generated notification ID
   - Contains notification data

### **Current Data Structure (What You Have Now):**
```javascript
// Document: /users/{userId}/boards/{boardId}
{
  name: "My Board",
  owner: "user123",
  ownerEmail: "user@example.com",
  members: {
    "user@example.com": {
      email: "user@example.com",
      role: "owner",
      joinedAt: "2025-01-12T12:00:00Z",
      status: "active"
    }
  },
  isPublic: false,
  settings: {
    allowComments: true,
    allowTaskCreation: true,
    allowMemberInvites: true
  },
  tabs: {                                 # These are your "lists"
    "todo": {
      id: "todo",
      name: "To Do", 
      color: "primary"
    },
    "inprogress": {
      id: "inprogress",
      name: "In Progress",
      color: "warning"  
    },
    "done": {
      id: "done",
      name: "Done",
      color: "success"
    }
  },
  tasks: {                               # Tasks organized by list ID
    "todo": [
      {
        id: "task-123",
        text: "Complete project",
        status: "todo",
        priority: "high",
        deadline: "2025-01-15T10:00:00Z",
        createdAt: "2025-01-12T12:00:00Z"
      }
    ],
    "inprogress": [...],
    "done": [...]
  },
  createdAt: "2025-01-12T12:00:00Z",
  updatedAt: "2025-01-12T12:30:00Z"
}
```

## 🆚 NoSQL vs SQL Comparison

| Aspect | Firestore (NoSQL) | MySQL (SQL) |
|--------|-------------------|-------------|
| **Data Structure** | Documents & Collections | Tables & Rows |
| **Schema** | Flexible, schemaless | Fixed schema required |
| **Relationships** | Embedded or referenced | Foreign keys & JOINs |
| **Scaling** | Horizontal (automatic) | Vertical (manual) |
| **Queries** | Limited but fast | Complex SQL queries |
| **Real-time** | Built-in real-time updates | Requires additional setup |

## 🔍 How to View Your Data

### **In Firebase Console:**
1. Go to Firebase Console → Firestore Database
2. Navigate to: `users` → `{your-user-id}` → `boards`
3. You'll see all your board documents

### **In Firebase Emulator:**
1. Start emulator: `npm run emulator`
2. Open: http://localhost:4000
3. Go to Firestore tab
4. Browse: `users` → `{user-id}` → `boards`

## 📈 Recommended Structure (New Architecture)

The new architecture I created normalizes this structure:

```javascript
// Document: /users/{userId}/boards/{boardId}
{
  metadata: {                            # Board info
    name: "My Board",
    owner: "user123", 
    // ... other metadata
  },
  lists: {                              # Normalized lists (was "tabs")
    "list-123": {
      id: "list-123",
      name: "To Do",
      color: "primary",
      position: 0
    }
  },
  tasks: {                              # Normalized tasks
    "task-456": {
      id: "task-456", 
      text: "Complete project",
      listId: "list-123",               # Reference to list
      priority: "high",
      // ... other task properties
    }
  },
  members: { /* member objects */ },
  settings: { /* board settings */ }
}
```

## 🎯 Benefits of Current vs New Structure

### **Current Structure:**
✅ Simple nested structure  
❌ Limited scalability (Firestore 1MB document limit)  
❌ Difficult to query individual tasks  
❌ No data validation  

### **New Structure:**  
✅ Scalable (unlimited tasks per board)  
✅ Better performance for large datasets  
✅ Easier to implement advanced features  
✅ Built-in validation and type safety  
✅ Better real-time update granularity

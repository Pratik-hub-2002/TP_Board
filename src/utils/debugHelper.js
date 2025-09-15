/**
 * Debug Helper for TP Board Firebase Issues
 * Helps diagnose and fix Firebase connection and data fetching problems
 */

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const debugFirebaseConnection = async () => {
  console.log('🔍 Starting Firebase Debug...');
  
  const results = {
    auth: null,
    firestore: null,
    userData: null,
    recommendations: []
  };

  try {
    // 1. Check Authentication
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      results.auth = {
        status: 'authenticated',
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified
      };
      console.log('✅ Auth Status: Authenticated as', currentUser.email);
    } else {
      results.auth = {
        status: 'not_authenticated'
      };
      console.log('❌ Auth Status: Not authenticated');
      results.recommendations.push('User needs to log in first');
      return results;
    }

    // 2. Check Firestore Connection
    try {
      const testDoc = doc(db, 'test', 'connection');
      await setDoc(testDoc, { timestamp: new Date().toISOString() });
      console.log('✅ Firestore: Connection successful');
      results.firestore = { status: 'connected' };
    } catch (error) {
      console.error('❌ Firestore: Connection failed', error);
      results.firestore = { 
        status: 'failed', 
        error: error.message 
      };
      results.recommendations.push('Check Firebase emulator is running');
      results.recommendations.push('Verify firestore.rules allow access');
    }

    // 3. Check User Data Structure
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log('✅ User document exists');
        results.userData = { exists: true, data: userDoc.data() };
      } else {
        console.log('⚠️ User document does not exist');
        results.userData = { exists: false };
        results.recommendations.push('Create user profile document');
      }

      // Check boards subcollection
      const boardsRef = collection(db, `users/${currentUser.uid}/boards`);
      const boardsSnapshot = await getDocs(boardsRef);
      
      console.log(`📊 Found ${boardsSnapshot.size} boards`);
      results.userData.boardsCount = boardsSnapshot.size;
      
      if (boardsSnapshot.size > 0) {
        const boards = [];
        boardsSnapshot.forEach(doc => {
          boards.push({
            id: doc.id,
            data: doc.data()
          });
        });
        results.userData.boards = boards;
        console.log('📋 Board IDs:', boards.map(b => b.id));
      } else {
        results.recommendations.push('No boards found - create a test board');
      }

    } catch (error) {
      console.error('❌ User data check failed:', error);
      results.userData = { 
        exists: false, 
        error: error.message 
      };
      results.recommendations.push('Check Firestore permissions');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
    results.recommendations.push('Check Firebase configuration');
  }

  return results;
};

export const createTestBoard = async () => {
  console.log('🧪 Creating test board...');
  
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.error('❌ No authenticated user');
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const testBoardData = {
      name: 'Debug Test Board',
      owner: currentUser.uid,
      ownerEmail: currentUser.email,
      members: {
        [currentUser.email]: {
          email: currentUser.email,
          role: 'owner',
          joinedAt: new Date().toISOString(),
          status: 'active'
        }
      },
      isPublic: false,
      settings: {
        allowComments: true,
        allowTaskCreation: true,
        allowMemberInvites: true
      },
      tabs: {
        'todo': { id: 'todo', name: 'To Do', color: 'primary' },
        'inprogress': { id: 'inprogress', name: 'In Progress', color: 'warning' },
        'done': { id: 'done', name: 'Done', color: 'success' }
      },
      tasks: {
        'todo': [
          {
            id: 'test-task-1',
            text: 'Test Task 1',
            status: 'todo',
            priority: 'medium',
            createdAt: new Date().toISOString()
          }
        ],
        'inprogress': [],
        'done': []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const boardRef = doc(db, `users/${currentUser.uid}/boards`, 'debug-test-board');
    await setDoc(boardRef, testBoardData);
    
    console.log('✅ Test board created successfully');
    return { 
      success: true, 
      boardId: 'debug-test-board',
      data: testBoardData
    };

  } catch (error) {
    console.error('❌ Failed to create test board:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

export const checkEmulatorStatus = () => {
  console.log('🔍 Checking Firebase Emulator Status...');
  
  const results = {
    auth: null,
    firestore: null,
    ui: null
  };

  // Check if running in emulator mode
  const isEmulator = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

  if (isEmulator) {
    console.log('🧪 Running in emulator environment');
    
    // Check emulator ports
    const checkPort = async (port, service) => {
      try {
        const response = await fetch(`http://localhost:${port}`);
        return { 
          port, 
          service, 
          status: response.ok ? 'running' : 'error',
          statusCode: response.status
        };
      } catch (error) {
        return { 
          port, 
          service, 
          status: 'not_running',
          error: error.message
        };
      }
    };

    // Common emulator ports
    Promise.all([
      checkPort(9099, 'Auth Emulator'),
      checkPort(8080, 'Firestore Emulator'), 
      checkPort(4000, 'Emulator UI')
    ]).then(portResults => {
      portResults.forEach(result => {
        console.log(`${result.status === 'running' ? '✅' : '❌'} ${result.service} (${result.port}): ${result.status}`);
      });
    });

  } else {
    console.log('🌐 Running in production environment');
  }

  return results;
};

export const fixCommonIssues = async () => {
  console.log('🔧 Running automatic fixes...');
  
  const fixes = [];

  try {
    // Fix 1: Ensure user document exists
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        });
        fixes.push('Created user profile document');
        console.log('✅ Created user profile document');
      }
    }

    // Fix 2: Clear any cached auth state
    if (typeof Storage !== 'undefined') {
      const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('firebase') || key.includes('auth')
      );
      
      if (authKeys.length > 0) {
        authKeys.forEach(key => localStorage.removeItem(key));
        fixes.push('Cleared cached auth state');
        console.log('✅ Cleared cached auth state');
      }
    }

  } catch (error) {
    console.error('❌ Auto-fix failed:', error);
    fixes.push(`Auto-fix failed: ${error.message}`);
  }

  return fixes;
};

// Export a comprehensive debug function
export const runFullDiagnostic = async () => {
  console.log('🚀 Running Full Firebase Diagnostic...');
  
  const diagnostic = {
    timestamp: new Date().toISOString(),
    emulator: checkEmulatorStatus(),
    connection: await debugFirebaseConnection(),
    fixes: await fixCommonIssues()
  };

  console.log('📊 Diagnostic Results:', diagnostic);
  
  // Generate recommendations
  const recommendations = [
    ...diagnostic.connection.recommendations,
    'Restart Firebase emulator if issues persist',
    'Check browser console for additional errors',
    'Verify Firebase configuration in firebase.js'
  ];

  console.log('💡 Recommendations:');
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });

  return diagnostic;
};

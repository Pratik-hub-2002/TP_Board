const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");

initializeApp();

// This function creates a corresponding boardsData document when a new board is created
exports.onBoardCreated = onDocumentCreated('users/{uid}/boards/{boardId}', async (event) => {
    logger.log('🔔 onBoardCreated function triggered');
    
    try {
        const { uid, boardId } = event.params;
        logger.log(`📝 Processing board creation for user ${uid}, board ${boardId}`);
        
        if (!uid || !boardId) {
            throw new Error('Missing required parameters: uid or boardId');
        }
        
        const firestore = getFirestore();
        const boardData = {
            tabs: {
                todo: [],
                inProgress: [],
                completed: [],
                backlog: []
            },
            lastUpdated: FieldValue.serverTimestamp(),
            createdBy: uid,
            createdAt: FieldValue.serverTimestamp()
        };
        
        const docPath = `users/${uid}/boardsData/${boardId}`;
        logger.log(`📄 Creating document at path: ${docPath}`, { data: boardData });
        
        await firestore.doc(docPath).set(boardData, { merge: true });
        logger.log('✅ Successfully created boardsData document');
        
        return null;
    } catch (error) {
        logger.error('❌ Error in onBoardCreated function:', error);
        // Re-throw the error to mark the function as failed
        throw error;
    }
});
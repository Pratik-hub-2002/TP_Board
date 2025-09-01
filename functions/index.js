const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");

initializeApp();

exports.onBoardCreated = onDocumentCreated("users/{uid}/boards/{boardId}", async (event) => {
    logger.log('🔔 onBoardCreated function triggered');
    
    try {
        const { uid, boardId } = event.params;
        const firestore = getFirestore();
        return await firestore.doc(`users/${uid}/boardsData/${boardId}`).set({
            tabs: {
                todo: [],
                inProgress: [],
                completed: [],
                backlog: []
            },
            lastUpdated: FieldValue.serverTimestamp(),
            createdBy: uid,
            createdAt: FieldValue.serverTimestamp()
        });
    } catch (error) {
        logger.error('❌ Error in onBoardCreated function:', error);
        // Re-throw the error to mark the function as failed
        throw error;
    }
});
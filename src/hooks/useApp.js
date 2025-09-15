import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { getAuth } from 'firebase/auth'
import useStore from '../store'

const useApp = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    console.log(' useApp hook called');
    console.log(' Current user:', currentUser);
    console.log(' User UID:', currentUser?.uid);
    
    if (!currentUser) {
        console.error(' No authenticated user found in useApp hook');
        throw new Error('User must be authenticated to use this hook');
    }
    
    const boardsColRef = collection(db, `users/${currentUser.uid}/boards`);
    const { setBoards,addBoard } = useStore();
    
    console.log(' Firestore path:', `users/${currentUser.uid}/boards`);

    const createBoard = async ({ name, color }) => {
        try {
            const docRef = await addDoc(boardsColRef, { 
                name, 
                color, 
                createdAt: serverTimestamp() 
            });
            
            // Get the document data with the ID
            const newBoard = { 
                id: docRef.id, 
                name, 
                color, 
                createdAt: new Date().toLocaleDateString() 
            };
            
            addBoard(newBoard);
            return newBoard; // Return the created board
        } catch (err) {
            console.error('Error creating board:', err);
            throw new Error('Failed to create board: ' + err.message);
        }
    } 

    const fetchBoards = async ( setLoading ) => {
        try {
            console.log('📊 Fetching boards from:', `users/${currentUser.uid}/boards`);
            const q = query(boardsColRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            console.log('📊 Query snapshot size:', querySnapshot.size);
            console.log('📊 Query snapshot empty:', querySnapshot.empty);
            
            const boards = querySnapshot.docs.map(doc => {
                const data = doc.data();
                console.log('📄 Document data:', doc.id, data);
                
                // Handle different createdAt formats
                let createdAtFormatted;
                if (data.createdAt) {
                    if (typeof data.createdAt === 'string') {
                        createdAtFormatted = data.createdAt;
                    } else if (data.createdAt.toDate) {
                        createdAtFormatted = data.createdAt.toDate().toLocaleDateString();
                    } else {
                        createdAtFormatted = new Date(data.createdAt).toLocaleDateString();
                    }
                } else {
                    createdAtFormatted = 'N/A';
                }
                
                return {
                    id: doc.id,
                    ...data,
                    createdAt: createdAtFormatted
                };
            });
            
            console.log('📊 Processed boards:', boards);
            setBoards(boards);
        } catch (err) {
            console.error('❌ Error fetching boards:', err);
        } finally {
            if(setLoading) setLoading(false);
        }
    }
    
    return { createBoard, fetchBoards };    
}

export default useApp
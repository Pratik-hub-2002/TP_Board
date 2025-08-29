import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { getAuth } from 'firebase/auth'
import useStore from '../store'

const useApp = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
        throw new Error('User must be authenticated to use this hook');
    }
    
    const boardsColRef = collection(db, `users/${currentUser.uid}/boards`);
    const { setBoards,addBoard } = useStore();

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
            const q = query(boardsColRef, orderBy('createdAt', 'desc'));
           const querySnapshot = await getDocs(q);
           const boards = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate().toLocaleDateString()
           }));
           setBoards(boards);
        } catch (err) {
            console.log(err);
        }finally{
            if(setLoading) setLoading(false);
        }
    }
    
    return { createBoard, fetchBoards };    
}

export default useApp
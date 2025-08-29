import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'
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
    const { setBoards } = useStore();

    const createBoard = async ({ name, color }) => {
        try {
            await addDoc(boardsColRef, { name, color, createdAt: serverTimestamp() });
        } catch (err) {
            console.log(err);
            throw err;
        }
    } 

    const fetchBoards = async ( setLoading ) => {
        try {
           const querySnapshot = await getDocs(boardsColRef);
           const boards = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
           }));
           setBoards(boards);
           setLoading(false);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
    
    return { createBoard, fetchBoards };    
}

export default useApp
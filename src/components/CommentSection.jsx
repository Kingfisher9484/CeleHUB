// CommentSection.jsx
import React, { useEffect, useState } from 'react';
import { db, auth } from '../../Firebase/Firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './CommentSection.css';

const CommentSection = () => {
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser({
            uid: firebaseUser.uid,
            name: `${userData.firstName} ${userData.lastName}`,
            role: userData.role || 'user'
          });
        } else {
          setUser({
            uid: firebaseUser.uid,
            name: 'Unknown User',
            role: 'user'
          });
        }
      }
    });

    const q = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeAuth();
      unsubscribeComments();
    };
  }, []);

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    await addDoc(collection(db, 'comments'), {
      content: newComment,
      userId: user.uid,
      userName: user.name,
      role: user.role,
      timestamp: serverTimestamp(),
      replies: []
    });
    setNewComment('');
  };

  const handleReply = async (commentId, replyText) => {
    if (!user || !replyText.trim()) return;

    const commentDoc = doc(db, 'comments', commentId);
    const targetComment = comments.find(c => c.id === commentId);
    const newReply = {
      replyId: `${user.uid}_${Date.now()}`,
      content: replyText,
      userId: user.uid,
      userName: user.name,
      role: user.role,
      timestamp: new Date()
    };

    const updatedReplies = [...(targetComment.replies || []), newReply];
    await updateDoc(commentDoc, { replies: updatedReplies });
  };

  return (
    <div className="comment-section">
      <h2>Comments</h2>
      <textarea
        className="comment-input"
        placeholder="Write a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <button className="comment-btn" onClick={handleAddComment}>Post</button>

      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <p><strong>{comment.userName} ({comment.role})</strong>: {comment.content}</p>
          <ReplySection comment={comment} user={user} onReply={handleReply} />
        </div>
      ))}
    </div>
  );
};

const ReplySection = ({ comment, user, onReply }) => {
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="reply-section">
      <button className="reply-toggle" onClick={() => setShowReplies(!showReplies)}>
        {showReplies ? 'Hide Replies' : 'View Replies'}
      </button>

      {showReplies && (
        <>
          {comment.replies?.map((r) => (
            <div key={r.replyId} className="reply">
              <p><strong>{r.userName} ({r.role})</strong>: {r.content}</p>
            </div>
          ))}
          {user && (
            <>
              <textarea
                className="reply-input"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button
                className="reply-btn"
                onClick={() => {
                  onReply(comment.id, replyText);
                  setReplyText('');
                }}
              >
                Reply
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CommentSection;

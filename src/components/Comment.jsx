// src/components/Comment.jsx
import React, { useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../Firebase/Firebase";

const Comment = ({ activeSection, currentUser, comments = [] }) => {
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const handleSend = async (parentId = null) => {
    if (!text.trim()) return;
  
    if (!currentUser || !currentUser.uid) {
      alert("You must be logged in to comment.");
      return;
    }
  
    await addDoc(collection(db, "comments"), {
      text,
      userId: currentUser.uid,
      userName: currentUser.name,
      isAdmin: currentUser.isAdmin || false,
      timestamp: serverTimestamp(),
      likes: [],
      views: 0,
      parentId,
    });
  
    setText("");
    setReplyTo(null);
  };
  

  const handleLike = async (comment) => {
    const ref = doc(db, "comments", comment.id);
    const isLiked = comment.likes?.includes(currentUser.uid);
    await updateDoc(ref, {
      likes: isLiked
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid),
    });
  };

  const handleDelete = async (comment) => {
    if (currentUser.uid === comment.userId || currentUser.isAdmin) {
      await deleteDoc(doc(db, "comments", comment.id));
    }
  };

  const renderReplies = (parentId) =>
    comments
      .filter((c) => c.parentId === parentId)
      .map((reply) => (
        <div key={reply.id} className="comment-replies">
          {renderComment(reply)}
        </div>
      ));

  const renderComment = (comment) => (
    <div className="comment-card" key={comment.id}>
      <div className="comment-header">
        <strong>{comment.userName}</strong>
        {comment.isAdmin && <span className="admin-badge">Admin</span>}
        <span className="comment-time">
          {comment.timestamp?.toDate().toLocaleString()}
        </span>
      </div>
      <p className="comment-text">{comment.text}</p>
      <div className="comment-actions">
        <button onClick={() => handleLike(comment)}>
          👍 {comment.likes?.length || 0}
        </button>
        <button onClick={() => setReplyTo(comment.id)}>💬 Reply</button>
        {(currentUser.uid === comment.userId || currentUser.isAdmin) && (
          <button onClick={() => handleDelete(comment)}>🗑️ Delete</button>
        )}
      </div>
      {replyTo === comment.id && (
        <div className="comment-reply-box">
          <textarea
            className="comment-textarea"
            placeholder="Reply..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
          />
          <button className="comment-btn" onClick={() => handleSend(comment.id)}>
            Reply
          </button>
        </div>
      )}
      {renderReplies(comment.id)}
    </div>
  );

  return (
    <>
      {activeSection === "comments" && (
        <div className="comments-section">
          <h2 className="comments-title">⚙️ Comments</h2>
          <div className="comments-block">
            <div className="comment-input">
              <textarea
                className="comment-textarea"
                placeholder="Write a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
              />
              <button className="comment-btn" onClick={() => handleSend(null)}>
                Send
              </button>
            </div>
            <div className="comments-list">
              {comments
                .filter((c) => !c.parentId)
                .map((comment) => renderComment(comment))}
            </div>
          </div>
        </div>
      )}

      {/* CSS styles inside component */}
      <style>{`
        .comments-section {
          animation: fadeIn 0.4s ease;
          padding: 20px;
          max-width: 800px;
          margin: auto;
        }

        .comments-title {
          font-size: 28px;
          margin-bottom: 20px;
        }

        .comments-block {
          background: #fafafa;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 10px;
        }

        .comment-input {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .comment-textarea {
          padding: 10px;
          font-size: 16px;
          border-radius: 8px;
          border: 1px solid #ccc;
          resize: none;
          transition: all 0.3s ease;
        }

        .comment-textarea:focus {
          border-color: #007bff;
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .comment-btn {
          align-self: flex-end;
          padding: 8px 16px;
          background-color: #007bff;
          border: none;
          color: #fff;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .comment-btn:hover {
          background-color: #0056b3;
        }

        .comment-card {
          background: #fff;
          border: 1px solid #ddd;
          padding: 16px;
          border-radius: 10px;
          margin-bottom: 15px;
          animation: slideIn 0.3s ease;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .comment-time {
          font-size: 12px;
          color: #777;
        }

        .admin-badge {
          background-color: gold;
          color: black;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 8px;
        }

        .comment-text {
          margin-top: 8px;
          font-size: 15px;
          color: #333;
        }

        .comment-actions {
          display: flex;
          gap: 15px;
          margin-top: 10px;
          font-size: 14px;
        }

        .comment-actions button {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .comment-actions button:hover {
          color: #0056b3;
        }

        .comment-reply-box {
          margin-top: 15px;
          padding-left: 15px;
          border-left: 2px solid #007bff;
        }

        .comment-replies {
          margin-top: 15px;
          padding-left: 20px;
          border-left: 2px solid #eee;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .comment-input {
            flex-direction: column;
          }

          .comment-btn {
            align-self: stretch;
          }

          .comments-section {
            padding: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default Comment;

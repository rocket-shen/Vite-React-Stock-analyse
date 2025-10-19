import React from 'react';
import './Modal.css'; // 可选：添加模态样式

const Modal = ({ children, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span></span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body financial-scroll">{children}</div>
        <div className="modal-footer">
          <button onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
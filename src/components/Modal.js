import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import styles from '../css/Modal.module.css';


const Modal = forwardRef(( _, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState({});
  const autoCloseTimeoutRef = useRef(null);

  // 부모 컴포넌트에서 ref를 통해 open, close를 호출할 수 있도록 설정
  useImperativeHandle(ref, () => ({
    open: (options = {}) => {
      // 옵션 업데이트
      const fullOptions = {
        title: "알림",
        closeBtn: true,
        message: "",
        fields: [],
        content: <div></div>,
        cancelText: "취소",
        cancelClass: "btn btn-secondary",
        confirmText: "확인",
        confirmClass: "btn btn-primary",
        onCancel: () => setIsOpen(false),
        onConfirm: () => setIsOpen(false),
        ...options,
      };

      setModalOptions(fullOptions);
      setIsOpen(true);

      // 이전 타이머 클리어
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }

      // autoCloseDelay가 설정된 경우만 자동 닫기 실행
      if (typeof fullOptions.autoCloseDelay === 'number') {
        autoCloseTimeoutRef.current = setTimeout(() => {
          setIsOpen(false);
        }, fullOptions.autoCloseDelay);
      }
    },
    close: () => setIsOpen(false),
  }));


  const onCancle = (() => {
    modalOptions.onCancel(false);
  });
  
  const onConfirm = (() => {
    modalOptions.onConfirm(true);
  });

  // useEffect(()=>{
  //   const handleKeyUp = (e) => {
  //     if (e.key === 'Enter') {
  //       modalOptions.onConfirm?.(true);  // 확인 핸들러 실행
  //       setIsOpen(false);               // 모달 닫기
  //     }
  //   };

  //   if (isOpen) {
  //     window.addEventListener('keyup', handleKeyUp);
  //   }

  //   return () => {
  //     window.removeEventListener('keyup', handleKeyUp);
  //   };
  // }, [isOpen, modalOptions]);


  if (!isOpen) return null;

  return (
    <div className={styles.fullscreenCenter} >
      <div className={styles.modal}>
        <div className="mb-2 d-flex justify-content-between">
          {/* title */}
          {modalOptions.title && (
            <h4 style={{ fontWeight: "bold", marginBottom: 0 }}>{modalOptions.title}</h4>
          )}

          {/* closeBtn */}
          {modalOptions.closeBtn && (
            <button
              onClick={onCancle}
              className="btn btn-sm btn-outline-secondary"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        {/* message */}
        {modalOptions.message && (
          <div style={{ padding: "10px" }}>
            <span>{modalOptions.message}</span>
          </div>
        )}

        {/* content */}
        {modalOptions.content}

        {/* button */}
        <div className={styles.buttonContainer}>
          {modalOptions.cancelText !== "" && (
            <button
              onClick={onCancle}
              className={`${modalOptions.cancelClass}`}
            >
              {modalOptions.cancelText}
            </button>
          )}
          {modalOptions.confirmText !== "" && (
            <button
              onClick={onConfirm}
              className={`${modalOptions.confirmClass}`}
            >
              {modalOptions.confirmText}
            </button>
          )}
        </div>

      </div>
    </div>
  );
});

export default Modal;
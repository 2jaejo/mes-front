import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';


import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'index.css';

// import 'bootstrap/dist/js/bootstrap.bundle.min.js';




//  fetch 오버라이드 - 인터셉터처럼 사용
// 기존 fetch 백업
const originalFetch = window.fetch;

// fetch 오버라이드
window.fetch = async (...args) => {
  const [url, config] = args;

  // 요청 전에 인터셉터처럼 처리할 코드 (예: 헤더에 Authorization 추가)
  const token = localStorage.getItem("accessToken");
  const modifiedConfig = {
    ...config,
    headers: {
      ...config.headers,
      Authorization: token ? `Bearer ${token}` : "",
      'Cache-Control': 'no-cache', // 항상 서버에서 최신 데이터 가져오기
    },
  };

  try {
    const response = await originalFetch(url, modifiedConfig);

    // 응답 후 처리 (인터셉터처럼 오류 처리)
    if (!response.ok) {
      if (response.status === 401) {
        // 인증 오류 처리 (예: 로그인 페이지로 리다이렉트)
        console.log("Authentication error (401), redirecting to login...");
        window.location.href = "/login";
      } else if (response.status === 500) {
        // 서버 오류 처리
        console.log("Server error (500)");
        alert("서버 오류가 발생했습니다.");
      }
    }

    return response;
  } catch (error) {
    // 네트워크 오류 처리
    console.error("Network error:", error);
    alert("네트워크 연결을 확인해주세요.");
    throw error; // 오류는 여전히 전달됨
  }
};
//  fetch 오버라이드 - 인터셉터처럼 사용



// React 17 이하에서는 ReactDOM.render 사용
ReactDOM.render(<App />, document.getElementById('root'));
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React, { useContext } from 'react'
import { useNavigate } from "react-router-dom";

import CurrentTime from "../components/Today";
import { GlobalContext } from "../utils/GlobalContext";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'

import { HeaderStyle } from "css/CommonStyle";


export default function Header() {

  const { theme, toggleTheme } = useContext(GlobalContext);
  const { isTab, toggleTab } = useContext(GlobalContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    // 🔹 1. 로컬 스토리지에서 토큰 정보 삭제
    localStorage.removeItem("accessToken");

    // 🔹 2. 로그인 페이지로 이동
    navigate("/login");
  };

  return (
    <div className='header d-flex justify-content-between align-items-center' style={HeaderStyle}>
      <div>
        <span>현재 theme: {theme} </span>
        <button className="btn btn-secondary" onClick={toggleTheme}>테마 변경</button>

      </div>
      <div>
        <span>현재 tab: {String(isTab)} </span>
        <button className="btn btn-secondary" onClick={toggleTab}>탭기능 활성화</button>

      </div>
      
      <div className="d-flex justify-content-end align-items-center gap-2">
        <CurrentTime />
        <button className="btn btn-primary" onClick={handleLogout}>
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
        </button>
      </div>


    </div>
  )
}

// LoginForm.js
import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styles from '../css/Login.module.css';
import axiosInstance from "../utils/Axios";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import Modal from "../components/Modal";

import { ThemeContext } from "utils/ThemeContext";

const LoginForm = () => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const modalRef = useRef();  
  const modalRef2 = useRef();  
  const modalInputData = useRef(); 

  const { theme, setTheme } = useContext(ThemeContext);

  const navigate = useNavigate();

  const DEFAULT_FORM = () => ({
    user_id:'',
    user_nm:'',
    pw:'',
    pw_chk:'',
    email: '',
    phone: '',
    addr: '',
    birthday: '',
  });

  const formRef = useRef(DEFAULT_FORM());

  const formRefChange = (name, value) => {
    formRef.current[name] = value;
  };

  const UserForm = ({ onChangeHandler }) => {
    console.log("UserForm");

    const [userForm, setUserForm] = useState({});

    const handleChange = (e) => {
      const { name, value } = e.target;
      setUserForm(prev => ({ ...prev, [name]: value }));
      onChangeHandler(name, value);
    };

    return (
      <div className={"p-2"}>
        <Table bordered style={{ width: 'auto', tableLayout: 'auto' }}>
          <tbody>
            <tr>
              <th className="bg-light text-end align-middle">아이디</th>
              <td>
                <Form.Control 
                  type="text"
                  name="user_id"
                  value={userForm.user_id ?? ''}
                  onChange={handleChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">비밀번호</th>
              <td>
                <Form.Control 
                  type="password"
                  name="pw"
                  value={userForm.pw ?? ''}
                  onChange={handleChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">비밀번호 확인</th>
              <td>
                <Form.Control 
                  type="password"
                  name="pw_chk"
                  value={userForm.pw_chk ?? ''}
                  onChange={handleChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">이름</th>
              <td>
                <Form.Control 
                  type="text"
                  name="user_nm"
                  value={userForm.user_nm ?? ''}
                  onChange={handleChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">이메일</th>
              <td>
                <Form.Control 
                  type="text"
                  name="email"
                  value={userForm.email ?? ''}
                  onChange={handleChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
            </tr>
            
            <tr>
              <th className="bg-light text-end align-middle">연락처</th>
              <td>
                <Form.Control
                  type="text"
                  name="phone"
                  value={userForm.phone ?? ''}
                  onChange={handleChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">주소</th>
              <td>
                <Form.Control
                  type="text"
                  name="addr"
                  value={userForm.addr ?? ''}
                  onChange={handleChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">생일</th>
              <td>
                <Form.Control
                  type="date"
                  name="birthday"
                  value={userForm.birthday ?? ''}
                  onChange={handleChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
            </tr>
            
          </tbody>
        </Table>
      </div>
    );
  };

  


  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 로그인 요청을 서버로 전송
    try {
      axiosInstance
      .post("/auth/login",JSON.stringify({ email, password }))
      .then((res) => {
        const data = res.data;

        // 성공적으로 로그인하면 토큰을 로컬스토리지에 저장
        localStorage.setItem('accessToken', data.token);

        // 테마확인
        setTheme({ color: data.user.color, bgColor: data.user.bg_color });

        // 로그인 성공 후 메인 페이지로 이동
        navigate('/'); 
      })
      .catch((error) => {
        console.error("Login failed:", error);
        setErrorMessage('An error occurred. Please try again.');
      });

    } catch (err) {
      console.error('Error during login:', err);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const joinUs = (e)=> {

    // 폼 초기화
    formRef.current = DEFAULT_FORM();

    modalRef.current.open({
      title:"회원가입",
      message: "회원가입을 진행합니다.",
      content: <UserForm onChangeHandler={formRefChange} />,
      onCancel:()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm:(res) => {


        if(formRef.current.user_id === "" || formRef.current.user_id === undefined){
          modalRef2.current.open({ title:"알림", message:"아이디를 입력하세요.", cancelText:"" });
          return;
        }

        if(formRef.current.pw === ""){
          modalRef2.current.open({ title:"알림", message:"비밀번호를 입력하세요.", cancelText:"" });
          return;
        }

        if(formRef.current.pw !== formRef.current.pw_chk){
          modalRef2.current.open({ title:"알림", message:"비밀번호가 일치하지 않습니다.", cancelText:"" });
          return;
        }

        if(formRef.current.user_nm === ""){
          modalRef2.current.open({ title:"알림", message:"이름을 입력하세요.", cancelText:"" });
          return;
        }

        axiosInstance
          .post("/auth/join", JSON.stringify(formRef.current))
          .then((res) => {
            modalRef.current.close();
            modalRef2.current.open({
              title:"알림",
              message: "회원가입을 완료하였습니다.",
              cancelText:""
            });
          })
          .catch((error) => console.error("Error fetching data:", error));   
      },
    });
  };


  return (
    <div className={styles.wrap}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className={styles.container}>
        <h2 className={styles.heading}>로그인</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>아이디:</label>
            <input
              type="text"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>비밀번호:</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="d-flex justify-content-around align-items-center gap-2">
            {/* <button type="button" className={styles.buttonJoin} onClick={joinUs}>회원가입</button> */}
            <button type="submit" className={styles.buttonLogin}>로그인</button>
          </div>
          {errorMessage && <p className="p-2 text-danger">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

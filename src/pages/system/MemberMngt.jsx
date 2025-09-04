import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { MainContentStyle } from "css/CommonStyle";


const MemberMngt = () => {
  const gridRef = useRef();  
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const selectedRow = useRef(0);

  const [rowData, setRowData] = useState();
  const [columnDefs] = useState([
    { headerName: "아이디", field: "user_id", sortable: true, align:"left" },
    { headerName: "이름", field: "user_nm", sortable: true, filter: "agTextColumnFilter", editable: false, align:"left"},
  ]);


  const [form, setForm] = useState({
    user_id: '',
    user_nm: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const [form2, setForm2] = useState({
    user_id:'',
    user_nm:'',
    email: '',
    phone: '',
    addr: '',
    birthday: '',
  });

  const handleChange2 = (e) => {
    setForm2({ ...form2, [e.target.name]: e.target.value });
  };



  const DEFAULT_FORM = () => ({
    user_id:'',
    user_nm:'',
    pw:'',
    pw_chk:'',
    email: '',
    phone: '',
    addr: '',
    birthday: '',
    grade:'',
  });

  const formRef = useRef(DEFAULT_FORM());

  const formRefChange = (name, value) => {
    formRef.current[name] = value;
  };

  const [menuList, setMenuList] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);

    useEffect(()=>{
      console.log("useEffect");
      getData();
    },[]);

  // 조회
  const getData = (params) => {
    console.log("getData");

    setLoading(true);

    axiosInstance
    .post(`/users/getUsers`, JSON.stringify(form))
    .then((res) => {
      setRowData(res.data);

    })
    .catch((error) => {
      console.error("Error fetching data:", error);

    })
    .finally(() =>{
      setLoading(false);
      
      // 그리드 행 선택
      let sel = selectedRow.current;
      if(typeof params === "number") sel = params;
      gridRef.current.forEachNode((node) => {
        if (node.rowIndex === sel) {
          node.setSelected(true);
        }
      });
    });;
    
  };



  const UserForm = ({ onChangeHandler }) => {
    console.log("UserForm");

    const [userForm, setUserForm] = useState({grade:'1'});

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
            {/* <tr>
              <th className="bg-light text-end align-middle">등급</th>
              <td className="d-flex align-items-center">
                <Form.Control
                  type="range"
                  name="grade"
                  value={userForm.grade ?? ''}
                  onChange={handleChange}
                  size="md" 
                  className="w-auto"
                  min="1"
                  max="9"
                  maxLength={50}
                  style={{padding:'0px', background: 'lightgray', borderRadius: '5px', height: '5px', outline: 'none' }}
                />
                <span className="ms-2">{userForm.grade ?? ''}</span>
              </td>
            </tr> */}
            
          </tbody>
        </Table>
      </div>
    );
  };
  
  // 추가
  const addData = (params) => {
    console.log("addData");

    // 폼 초기화
    formRef.current = DEFAULT_FORM();

    modalRef.current.open({
      title: "추가",
      message: "추가하시겠습니까?",
      content: <UserForm onChangeHandler={formRefChange} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {


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

        modalRef.current.update({ isLoading: true });
        axiosInstance
          .post("/users/addUser", JSON.stringify(formRef.current))
          .then((res) => {
            getData();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          })
          .finally(() => {
            modalRef.current.update({ isLoading: false });
            modalRef.current.close();
          });

      }, 
    });

  };


  // 삭제
  const delData = (params) => {
    console.log("delData");
    
    const selectRows = gridRef.current.getSelectedRows();
    
    if(selectRows.length === 0) {
      modalRef.current.open({ title:"알림", message:"선택된 항목이 없습니다.", cancelText:"" });
      return;
    }
    
    // 모달 열기
    modalRef.current.open({
      title:"삭제",
      message:`${selectRows[0].user_id}(${selectRows[0].user_nm}) - 삭제하시겠습니까?`,
      confirmText:"삭제",
      confirmClass:"btn btn-danger",
      onCancel:()=>{
        modalRef.current.close();
      },
      onConfirm:(res) => {
        
        
        // 나중에 데이터 전체 넘기고 batch 처리 필요
        selectRows.forEach( (el)=>{
          axiosInstance
          .post(`/users/delUser`, JSON.stringify(el))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.close();
            modalRef2.current.open({ title:"알림", message:error.response?.data?.message || error.message, cancelText:"" });
          });    
        });
      },
    });
    
  };


  // 사용자 정보 설정
  const setData = (params) => {
    console.log("setData");

    if (form2.user_id === ""){
      modalRef.current.open({ title:"알림", message:"사용자를 선택하세요.", cancelText:"" });
      return;
    }
    
    axiosInstance
      .post("/users/setUser", JSON.stringify(form2))
      .then((res) => {
        modalRef.current.open({ title:"알림", message:"적용되었습니다.", cancelText:"" });
        
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"알림", message:error.message, cancelText:"" });
      });   
  };


  // 사용자 메뉴 설정
  const setMenu = (params) => {
    console.log("setMenu");

    if (form2.user_id === ""){
      modalRef.current.open({ title:"알림", message:"사용자를 선택하세요.", cancelText:"" });
      return;
    }
   
    const data = {
      user_id: form2.user_id,
      menus: selectedMenus,
    }
    axiosInstance
    .post(`/users/setMenu`, JSON.stringify(data))
    .then((res) => {
      modalRef.current.open({ title:"알림", message:"적용되었습니다.", cancelText:"" });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"알림", message:error.message, cancelText:"" });
    });   
  };


  // onGridReady에서 이벤트 리스너 추가
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장
    

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      
    });

    
    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      
      const selectedRows = ev.api.getSelectedRows();
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){
        setLoading2(true);
        axiosInstance
          .post(`/users/getUser`, JSON.stringify(selectedRows[0]))
          .then((res) => {
            setForm2({...res.data.user_info});

            setMenuList(res.data.user_menu);
            setSelectedMenus(res.data.user_menu.filter(menu => menu.show === 'y').map((menu) => menu.menu_id));
            setLoading2(false);
          })
          .catch((error) => console.error("Error fetching data:", error));
      };

    });

  };

  
  return (
    <div style={MainContentStyle}>

      <div className="p-2 mb-2 border bg-light">
        <Row className="">
          <Col className="d-flex gap-2">
            <Form.Control 
              type="text"
              name="user_id"
              value={form.user_id}
              onChange={handleChange}
              onKeyUp={(e)=>{if(e.code === 'Enter') getData()}}
              size="sm" 
              className="w-auto"
              placeholder="아이디"
              maxLength={50}
            />
        
            <Form.Control
              type="text"
              name="user_nm"
              value={form.user_nm}
              onChange={handleChange}
              onKeyUp={(e)=>{if(e.code === 'Enter') getData()}}
              size="sm" 
              className="w-auto"
              placeholder="이름"
              maxLength={50}
            />
                            
            <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-search"></i></Button>
          </Col>
        </Row>
      </div>

      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 pe-0 d-flex flex-column" xs={12} md={4}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">사용자 목록</span>
              <Button size="sm" variant="success" onClick={addData}>추가</Button>
              <Button size="sm" variant="danger" onClick={delData}>삭제</Button>
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
            />
          </Col>

          <Col className="h-100 pe-0 d-flex flex-column" xs={12} md={4}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">사용자 정보</span>
            </div>

            <div className="p-2 border w-100 h-100">

              {loading2 ? (

                <div className="d-flex justify-content-center align-items-center h-100">
                  <div>
                    <button className="btn btn-primary" type="button" disabled>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Loading...
                    </button>
                  </div>
                </div>

              ) : (
                <div className="overflow-auto">

                  <Table key={"tb_userInfo"} bordered hover style={{ width: 'auto', tableLayout: 'auto' }}>
                    <tbody>
                      <tr>
                        <th className="bg-light text-end align-middle">아이디</th>
                        <td>
                          <Form.Control 
                            type="text"
                            name="user_id"
                            value={form2.user_id ?? ''}
                            size="sm" 
                            className="w-auto"
                            maxLength={50}
                            disabled
                          />
                        </td>
                      </tr>
  
                      <tr>
                        <th className="bg-light text-end align-middle">이름</th>
                        <td>
                          <Form.Control 
                            type="text"
                            name="user_nm"
                            value={form2.user_nm ?? ''}
                            onChange={handleChange2}
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
                            value={form2.email ?? ''}
                            onChange={handleChange2}
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
                            value={form2.phone ?? ''}
                            onChange={handleChange2}
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
                            value={form2.addr ?? ''}
                            onChange={handleChange2}
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
                            value={form2.birthday ?? ''}
                            onChange={handleChange2}
                            size="sm" 
                            className="w-auto"
                            maxLength={50}
                          />
                        </td>
                      </tr>
                      
                    </tbody>
                  </Table>
  
                  <Button size="sm" variant="secondary" onClick={setData}>적용</Button>
                </div>

              )}
            </div>
          </Col>

          <Col className="h-100 d-flex flex-column" xs={12} md={4}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">사용자 메뉴</span>
            </div>

            <div className="p-2 border w-100 h-100">

              {loading2 ? (

                <div className="d-flex justify-content-center align-items-center h-100">
                  <div>
                    <button className="btn btn-primary" type="button" disabled>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Loading...
                    </button>
                  </div>
                </div>

              ) : (
                <div>

                  <Table key={"tb_userMenu"} bordered hover style={{ width: 'auto', tableLayout: 'auto' }}>
                    <tbody>
                      {menuList.map((menu) => (

                        <tr key={menu.menu_id}>
                          <th className="bg-light text-end align-middle">{menu.menu_nm}</th>
                          <td className="px-3">

                            <Form.Check
                              key={menu.menu_id}
                              type="checkbox"
                              className="fs-5"
                              value={menu.menu_id}
                              checked={selectedMenus.includes(menu.menu_id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const id = e.target.value;
                                // setSelectedMenus((prev) =>
                                //   checked ? [...prev, id] : prev.filter((m) => m !== id)
                                // );
                                console.log(checked);
                                console.log(id);
                                console.log(selectedMenus);

                                if (checked) {
                                  setSelectedMenus(prev => [...prev, id]);
                                } else {
                                  setSelectedMenus(prev => prev.filter(id => id !== menu.menu_id));
                                }
                              }}
                            />

                          </td>
                        </tr>
                    
                      ))}
                      
                    </tbody>
                  </Table>
  
                  <Button size="sm" variant="secondary" onClick={setMenu}>적용</Button>
                </div>

              )}
            </div>
          </Col>


        </Row>

      </div>

      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />
    </div>
  );
}

export default MemberMngt;





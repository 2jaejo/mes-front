import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";

import * as XLSX from "xlsx";
import { comm } from "utils/CommonFunctions";

const Main = () => {
  const modalRef = useRef();  
  const modalRef2 = useRef();  
  
  const [loading, setLoading] = useState(false);


  // selectbox
  const selectBox = useRef({}); 

  

  // grid cell code_name 변환
  const commonTypeFormatter = (params, cd) => {
    const arr_client_type = selectBox.current.common?.[cd] || [];
    const item = arr_client_type.find(el => el.code === params.value);
    return item ? item.code_name : params.value; 
  };
  
  // 그리드 설정
  const gridRef = useRef();  
  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState([]);

  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
      setData(ev.data);
    });

    
    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      

      const selectedRows = params.api.getSelectedRows();
      console.log(selectedRows);
    });

  };


  useEffect(()=>{
    console.log("useEffect");

    const init = {
      category: '',
      code: ['cd001', 'cd010']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {

        selectBox.current = res.data;

        setColumnDefs([
          { headerName: "매입처코드", field: "client_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
          { headerName: "매입처명", field: "client_name", sortable: true, editable: true, filter: "agTextColumnFilter",  align:"left"},
          { headerName: "사업자(주민)번호", field: "biz_num", sortable: true, editable: false, align:"center"},
          // { headerName: "상호명", field: "business_name", sortable: true, editable: false, align:"left"},
          { headerName: "대표자명", field: "ceo_name", sortable: true, editable: false, align:"left"},
          { headerName: "사업장주소", field: "office_address", sortable: true, editable: true, align:"left",width:300},
          { headerName: "사업장 상세주소", field: "office_address2", sortable: true, editable: true, align:"left"},
          { headerName: "전화", field: "phone", sortable: true, editable: true, align:"center"},
          { headerName: "휴대전화", field: "mobile_phone", sortable: true, editable: true, align:"center"},
          { headerName: "팩스", field: "fax", sortable: true, editable: true, align:"center"},
          { headerName: "등록일", field: "created_at", sortable: true, editable: false, align:"center"},
          { headerName: "등록자", field: "created_by", sortable: true, editable: false, align:"center"},
          { headerName: "수정일", field: "updated_at", sortable: true, editable: false, align:"center"},
          { headerName: "수정자", field: "updated_by", sortable: true, editable: false, align:"center"},
          { 
            headerName: "사용여부", 
            field: "use_yn", 
            sortable: true, 
            editable: false,
            backgroundColor: "#a7d1ff29",
            align:"center",
            cellRenderer: 'agCheckboxCellRenderer',
            cellRendererParams: {
              disabled: false,
            },
             // Y/N 값을 true/false로 변환하여 체크박스 표시
            valueGetter: (params) => {
              return params.data.use_yn === 'Y';
            },
      
            // 체크박스 변경 시 true/false → Y/N 으로 반영
            valueSetter: (params) => {
              const newValue = params.newValue ? 'Y' : 'N';
              if (params.data.use_yn !== newValue) {
                params.data.use_yn = newValue;
                return true; // 값이 바뀐 경우만 true
              }
              return false; // 변경 없음
            },
          },
          { headerName: "비고", field: "comment", sortable: true, editable: true, align:"left", minWidth:300, flex:1},
        ]);

        getData();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });  
      
    
  },[]);

  // 검색창 입력필드
  const [form, setForm] = useState({
    client_code:'',
    client_name:'',
    client_type:'매입처',
    use_yn: '',
  });

  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // 추가 모달
  const DEFAULT_FORM = (init={}) => ({
    client_code : ''
    , client_name : ''
    , client_type : '매입처'
    , biz_num : ''
    , business_name : ''
    , ceo_name : ''
    , office_address : ''
    , office_address2 : ''
    , phone : ''
    , mobile_phone : ''
    , fax : ''
    , use_yn : 'Y'
    , comment : ''
    , ...init
  });

  const formRef = useRef();

  const formRefChange = (name, value) => {
    formRef.current[name] = value;
  };

  const ModalForm = ({ form={}, onChangeHandler }) => {
    console.log("ModalForm");

    const [modalForm, setModalForm] = useState(form);

    const modalFormChange = (e) => {
      const { name, value } = e.target;
      setModalForm(prev => ({ ...prev, [name]: value }));
      onChangeHandler(name, value);
    };

    return (
      <div className={"p-2"}>
        <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
          <tbody>
            
            <tr>
              <th className="bg-light text-end align-middle">매입처코드</th>
              <td>
                <Form.Control 
                  type="text"
                  name="client_code"
                  value={modalForm.client_code ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={21}
                />
              </td>
              <th className="bg-light text-end align-middle">매입처명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="client_name"
                  value={modalForm.client_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={51}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">사업자(주민)번호</th>
              <td>
                <Form.Control 
                  type="text"
                  name="biz_num"
                  value={modalForm.biz_num ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={21}
                />
              </td>
            
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">상호명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="business_name"
                  value={modalForm.business_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={51}
                />
              </td>
          
              <th className="bg-light text-end align-middle">대표자명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="ceo_name"
                  value={modalForm.ceo_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={21}
                />
              </td>

            </tr>
            <tr>

              <th className="bg-light text-end align-middle">사업장주소</th>
              <td colSpan={3}>
                <Form.Control 
                  type="text"
                  name="office_address"
                  value={modalForm.office_address ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-100"
                  maxLength={51}
                />
              </td>
              
            </tr>
            <tr>

              <th className="bg-light text-end align-middle">사업장 상세주소</th>
              <td colSpan={3}>
                <Form.Control 
                  type="text"
                  name="office_address2"
                  value={modalForm.office_address2 ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-100"
                  maxLength={51}
                />
              </td>
              
            </tr>
            <tr>
              

              <th className="bg-light text-end align-middle">우편번호</th>
              <td>
                <Form.Control 
                  type="text"
                  name="office_zipcode"
                  value={modalForm.office_zipcode ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={11}
                />
              </td>

              <th className="bg-light text-end align-middle">전화</th>
              <td>
                <Form.Control 
                  type="text"
                  name="phone"
                  value={modalForm.phone ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={21}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">휴대전화</th>
              <td>
                <Form.Control 
                  type="text"
                  name="mobile_phone"
                  value={modalForm.mobile_phone ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={21}
                />
              </td>

              <th className="bg-light text-end align-middle">팩스</th>
              <td>
                <Form.Control 
                  type="text"
                  name="fax"
                  value={modalForm.fax ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={21}
                />
              </td>
              
            </tr>
            <tr>

              <th className="bg-light text-end align-middle">비고</th>
              <td colSpan={3}>
                <Form.Control 
                  type="text"
                  name="comment"
                  value={modalForm.comment ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-100"
                  maxLength={200}
                />
              </td>
              
            </tr>
            

          </tbody>
        </Table>
      </div>
    );
  };

  // 추가 모달 기본값
  const DEFAULT_FORM2 = (init={}) => ({
      data : ''
    , comment : ''
    , ...init
  });

  // 추가 모달 입력필드 저장
  const formRef2 = useRef();

  // 추가 모달 입력필드 변경
  const formRefChange2 = (name, value) => {
    formRef2.current[name] = value;
  };

  // 추가 모달 컴포넌트
  const ModalForm2 = ({ form={}, onChangeHandler }) => {
    console.log("ModalForm2");

    const [modalForm, setModalForm] = useState(form);

    const modalFormChange = (e) => {
      const { name, value, files } = e.target;
      setModalForm(prev => ({ ...prev, [name]: value }));
      if( files && files.length > 0 ) {
        onChangeHandler(name, files[0]);
      } else {
        onChangeHandler(name, value);
      }
    };

    return (
      <div className={"p-2"}>
        <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
          <tbody>
            <tr>
              <th className="bg-light text-end align-middle">파일첨부</th>
              <td colSpan={3}>
                <Form.Control
                  type="file"
                  name="data"
                  value={modalForm.data ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-100"
                  accept=".xlsx, .xls"
                />
              </td>
              
            </tr>
          </tbody>
        </Table>
      </div>
    );
  };


  // 추가 모달 기본값
  const DEFAULT_FORM3 = (init={}) => ({
    client_code : ''
    , client_name : ''
    , client_type : '매입처'
    , biz_num : ''
    , business_name : ''
    , ceo_name : ''
    , office_address : ''
    , office_address2 : ''
    , phone : ''
    , mobile_phone : ''
    , fax : ''
    , ...init
  });
 

  // 추가 모달 입력필드 저장
  const formRef3 = useRef();

  // 추가 모달 입력필드 변경
  const formRefChange3 = (name, value) => {
    formRef3.current[name] = value;
  };

  // 추가 모달 컴포넌트
  const ModalForm3 = ({ form={}, onChangeHandler }) => {
    console.log("ModalForm3");

    const [modalForm, setModalForm] = useState(form);

    const modalFormChange = (e) => {
      const { name, value, files } = e.target;

      // 영어면 대문자, 영어 외면 빈 문자열
      const isEnglish = /^[a-zA-Z]$/.test(value);
      const cleanedValue = isEnglish ? value.toUpperCase() : '';

      setModalForm(prev => ({ ...prev, [name]: cleanedValue }));
      if( files && files.length > 0 ) {
        onChangeHandler(name, files[0]);
      } else {
        onChangeHandler(name, cleanedValue);
      }
    };

    return (
      <div className="p-2" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
          <tbody>
            <tr>
              <th className="bg-light text-end align-middle">매입처코드</th>
              <td>
                <Form.Control 
                  type="text"
                  name="client_code"
                  value={modalForm.client_code ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">매입처명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="client_name"
                  value={modalForm.client_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">사업자(주민)번호</th>
              <td>
                <Form.Control 
                  type="text"
                  name="biz_num"
                  value={modalForm.biz_num ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>
           
            <tr>
              <th className="bg-light text-end align-middle">상호명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="business_name"
                  value={modalForm.business_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">대표자명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="ceo_name"
                  value={modalForm.ceo_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            
            <tr>
              <th className="bg-light text-end align-middle">사업장주소</th>
              <td>
                <Form.Control 
                  type="text"
                  name="office_address"
                  value={modalForm.office_address ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">상세주소</th>
              <td>
                <Form.Control 
                  type="text"
                  name="office_address2"
                  value={modalForm.office_address2 ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>
        
            <tr>
              <th className="bg-light text-end align-middle">전화</th>
              <td>
                <Form.Control 
                  type="text"
                  name="phone"
                  value={modalForm.phone ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">휴대전화</th>
              <td>
                <Form.Control 
                  type="text"
                  name="mobile_phone"
                  value={modalForm.mobile_phone ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">팩스</th>
              <td>
                <Form.Control 
                  type="text"
                  name="fax"
                  value={modalForm.fax ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            {/* <tr>
              <th className="bg-light text-end align-middle">등록일</th>
              <td>
                <Form.Control 
                  type="text"
                  name="created_at"
                  value={modalForm.created_at ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">등록자</th>
              <td>
                <Form.Control 
                  type="text"
                  name="created_by"
                  value={modalForm.created_by ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">수정일</th>
              <td>
                <Form.Control 
                  type="text"
                  name="updated_at"
                  value={modalForm.updated_at ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
              
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">수정자</th>
              <td>
                <Form.Control 
                  type="text"
                  name="updated_by"
                  value={modalForm.updated_by ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={1}
                />
              </td>
            </tr> */}
            

          </tbody>
        </Table>
      </div>
    );
  };





  // 조회
  const getData = (params) => {
    console.log("getData");
    

    const data = {...form};

    setLoading(true);
    const startTime = Date.now(); // 요청 전 시간 기록
    axiosInstance
      .post(`/api/getClient`, JSON.stringify(data))
      .then((res) => {
        const endTime = Date.now(); // 응답 시간을 측정
        const responseTime = endTime - startTime; // 응답 시간 (밀리초)
        const delay = responseTime < 300 ? 300 - responseTime : 0; // 응답 시간이 남은 시간만큼 지연
        
        // 지연 후 응답을 출력
        setTimeout(async () => {
          setRowData(res.data);
          setLoading(false);
        }, delay);
          
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });   
  };


  // 수정
  const setData = (params) => {
    console.log("setData");

    axiosInstance
      .post("api/setClient", JSON.stringify(params))
      .then((res) => {
        getData();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
        getData();
      });   
  };


  // 추가
  const addData = (params) => {
    console.log("addData");

    // 폼 초기화

    formRef.current = DEFAULT_FORM();
    formRef.current["parent_id"] = form.category_id;
    formRef.current["parent_nm"] = form.category_nm;

    modalRef.current.open({
      title: "매입처 추가",
      message: "추가하시겠습니까?",
      content: <ModalForm form={{parent_id:form.category_id, parent_nm:form.category_nm}} onChangeHandler={formRefChange} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        
        if(formRef.current.client_code === "" || formRef.current.client_code === undefined){
          modalRef2.current.open({ title:"알림", message:"매입처코드를 입력하세요.", cancelText:"" });
          return;
        }
        
        if(formRef.current.client_name === ""){
          modalRef2.current.open({ title:"알림", message:"매입처명을 입력하세요.", cancelText:"" });
          return;
        }
        
        modalRef.current.update({ isLoading: true });

        axiosInstance
          .post(`/api/addClient`, JSON.stringify(formRef.current))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.close();
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          })
          .finally(() => {
            modalRef.current.update({ isLoading: false });
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
      message:`선택된 행을 삭제하시겠습니까?`,
      confirmText:"삭제",
      confirmClass:"btn btn-danger",
      onCancel:()=>{
        modalRef.current.close();
      },
      onConfirm:(res) => {
        
        axiosInstance
          .post(`/api/delClient`, JSON.stringify(selectRows))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.close();
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          });    
 
      },
    });
    
  };


  

  // mapping
  const mappingData = (params) => {
    console.log("mappingData");

    let data = {category: 'vendor'};

    axiosInstance
      .post(`/api/excelMapping`, JSON.stringify(data))
      .then((res) => {
        
        const mappingData = res.data;

        if(mappingData.length === 0) {
          modalRef2.current.open({ title:"알림", message:"엑셀 매핑 정보가 없습니다.", cancelText:"" });
          return;
        }
        
        const reversed = Object.fromEntries(
          Object.entries(mappingData)
          .filter(([k, v]) => v && v.trim?.()) // category, null, undefined, '', '  ' 제거
          .map(([k, v]) => [v.trim(), k])
        );


        // 폼 초기화
        formRef3.current = DEFAULT_FORM3(reversed);

        // 모달 열기
        modalRef.current.open({
          title:"맵핑",
          confirmText:"적용",
          confirmClass:"btn btn-primary",
          content: <ModalForm3 form={formRef3.current} onChangeHandler={formRefChange3} />,
          onCancel:()=>{
            modalRef.current.close();
          },
          onConfirm:(res) => {

            const reversed = Object.fromEntries(
              Object.entries(formRef3.current)
              .filter(([k, v]) => v && v.trim?.()) // category, null, undefined, '', '  ' 제거
              .map(([k, v]) => [v.trim(), k])
            );

            modalRef.current.update({ isLoading: true });

            axiosInstance
              .post(`/api/setExcelMapping`, JSON.stringify(reversed))
              .then((res) => {
                modalRef2.current.open({ title:"알림", message:"적용되었습니다.", cancelText:"" });
              })
              .catch((error) => {
                console.error("Error fetching data:", error);
                modalRef.current.close();
                modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
              })
              .finally(() => {
                modalRef.current.update({ isLoading: false });
              });
          },
        });


      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.close();
        modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
      });    
    
    
    
  };


  // excel 업로드
  const uploadExcel = (params) => {
    console.log("uploadExcel");




    // 폼 초기화
    formRef2.current = DEFAULT_FORM2({
      data: ''
    });
    
    // 모달 열기
    modalRef.current.open({
      title:"파일 업로드",
      confirmText:"적용",
      confirmClass:"btn btn-primary",
      content: <ModalForm2 form={formRef2.current} onChangeHandler={formRefChange2} />,
      onCancel:()=>{
        modalRef.current.close();
      },
      onConfirm:(res) => {

        const file = formRef2.current.data;
        if (!file) {
          modalRef2.current.open({ title:"알림", message:"엑셀 파일을 선택하세요.", cancelText:"" });
          return;
        }


        modalRef.current.update({ isLoading: true });

        let data = {category: 'vendor'};
        axiosInstance
          .post(`/api/excelMapping`, JSON.stringify(data))
          .then((res) => {

            const { category, ...mappingData } = res.data;

            if(mappingData.length === 0) {
              modalRef2.current.open({ title:"알림", message:"엑셀 매핑 정보가 없습니다.", cancelText:"" });
              return;
            }

            // 엑셀 파일 읽기
            const reader = new FileReader();
            reader.onload = (evt) => {
              const binaryStr = evt.target.result;
    
              // 워크북 파싱
              const workbook = XLSX.read(binaryStr, { type: "binary" });
    
              // 첫 번째 시트 가져오기
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
    
              // 시트 데이터를 JSON으로 변환
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
              jsonData.shift(); // 첫 번째 행(헤더) 제거

              // console.log(jsonData);
              
              // 헤더 직접 지정
              const mappedData = jsonData.map(row => {
                const newRow = {};
                for (const key in row) {
                  const mappedKey = mappingData[key];
                  if (typeof mappedKey === 'string' && mappedKey.trim() !== '') {
                    newRow[comm.camelToSnake(mappedKey)] = row[key];
                  }
                  // else는 아무 처리도 안 해서 해당 키-값은 제외됨
                }

                // 기본값 설정
                newRow['client_type'] = '매입처';
                return newRow;
              });

              // console.log(mappedData);

              // return;

              const data = {
                tb: 'client',
                items: mappedData
              };
       
              axiosInstance
                .post(`/api/addExcelMapping`, JSON.stringify(data))
                .then((res) => {
                  
                  modalRef2.current.open({ title:"알림", message:"적용되었습니다.", cancelText:"" });
                  modalRef.current.close();
                  getData(); // 데이터 새로고침
                })
                .catch((error) => {
                  console.error("Error fetching data:", error);
                  modalRef.current.close();
                  modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
                })
                .finally(() => {
                  modalRef.current.update({ isLoading: false });
                });


            };
    


            // 파일 읽기 시작
            reader.readAsArrayBuffer(file);


          });



 
      },
    });
    
  };


  
  return (
    <div style={{ height: '87vh', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="d-flex gap-2">
            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">매입처코드</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="client_code"
                        value={form.client_code}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        maxLength={50}
                        placeholder=""
                      />
                    </div>
                  </td>

                  <th className="bg-light text-end align-middle">매입처명</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="client_name"
                        value={form.client_name}
                        onChange={handleChange}
                        onKeyUp={(e)=>{if(e.code === 'Enter') getData()}}
                        size="sm" 
                        className="w-auto"
                        maxLength={50}
                        placeholder=""
                      />
                    </div>
                  </td>

                  {/* <th className="bg-light text-end align-middle">매입처유형</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Select 
                        name="client_type" 
                        value={form.client_type} 
                        onChange={handleChange}
                        size="sm"
                        className="w-auto"
                      >
                        <option value="">전체</option>
                        {(selectBox.current.common?.['cd001'] || [])
                          .filter(opt => opt.use_yn === 'Y')
                          .map(opt => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code_name}
                            </option>
                        ))}
                      </Form.Select>
                    </div>
                  </td> */}

                  <th className="bg-light text-end align-middle">사용여부</th>
                  <td className="">
                    
                    <Form.Select 
                      name="use_yn" 
                      value={form.use_yn} 
                      onChange={handleChange}
                      size="sm"
                      className="w-auto"
                    >
                      <option value="">전체</option>
                      {(selectBox.current.common?.['cd010'] || [])
                        .filter(opt => opt.use_yn === 'Y')
                        .map(opt => (
                          <option key={opt.code} value={opt.code}>
                            {opt.code_name}
                          </option>
                      ))}
                    </Form.Select>
                  </td>
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-search"></i></Button>
                  </td>
                  
                </tr>

              </tbody>
            </Table>

          </Col>
        </Row>
      </div>

      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 pe-0 d-flex flex-column" xs={12} md={12}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">매입처 목록</span>
              <Button size="sm" variant="success" onClick={addData}>추가</Button>
              <Button size="sm" variant="danger" onClick={delData}>삭제</Button>
              <Button size="sm" variant="primary" onClick={mappingData}>업로드 맵핑</Button>
              <Button size="sm" variant="primary" onClick={uploadExcel}>파일 업로드</Button>
            </div>

            <GridExample
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"multiRow"}
              pageSize={1000}  
            />
          </Col>


        </Row>

      </div>


    </div>
  );
}

export default Main;





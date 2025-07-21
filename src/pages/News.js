import React, { useState, useRef } from "react";

import Forms from "../components/Forms";
import axiosInstance from "../utils/Axios";
import GridExample from "../components/GridExample";
import Buttons from "../components/Buttons";
import Modal from "../components/Modal";

function News() {
  const gridRef = useRef();  
  const modalRef = useRef();  
  const modalRef2 = useRef();  
  const modalInputData = useRef();  

  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState();
  const [columnDefs] = useState([
    { headerName: "아이디", field: "id", sortable: true, },
    { headerName: "이름", field: "user_nm", filter: "agTextColumnFilter", editable: true, align:"left"},
    { headerName: "이메일", field: "user_mail", align:"right"},
  ]);

  const [searchQuery, setSearchQuery] = useState({});

  

  // 동적으로 생성할 입력 필드
  const fields = [
    { name: "date", 
      type: "date", 
      label: "날짜", 
      default: new Date().toISOString().substring(0, 10), 
      className:"form-control form-control-sm",
    },
    {
      name: "sel",
      type: "select",
      label: "선택",
      options: [
        { key: "전체", value: "" },
        { key: "선택1", value: "1" },
        { key: "선택2", value: "2" },
        { key: "선택3", value: "3" },
      ],
      className:"form-select form-select-sm",
    },
    {
      name: "opt",
      type: "radio",
      label: "옵션",
      options: [
        { key: "옵션1", value: "1" },
        { key: "옵션2", value: "2" },
        { key: "옵션3", value: "3" },
      ],
      default:'1',
      className:"",
    },
    {
      name: "chk",
      type: "checkbox",
      label: "체크",
      options: [
        { key: "체크1", value: "1" },
        { key: "체크2", value: "2" },
        { key: "체크3", value: "3" },
        { key: "체크4", value: "4" },
      ],
      className:"",
    },
    { name: "name", type: "text", label: "이름", className:"form-control form-control-sm", },
    { name: "num", type: "number", label: "번호", className:"form-control form-control-sm", },
  ];


  // 검색창 데이터 변경시 호출되는 함수
  const handleSearchData = (data) => {
    setSearchQuery(data);
  };

  // 모달 입력필드 데이터 변경시 호출되는 함수
  const handleModalData = (data) => {
    modalInputData.current = data;
  };


  // 조회
  const getData = (params) => {
    console.log("getData");

    setLoading(true);
    
    const queryString = new URLSearchParams(searchQuery).toString();
    
    const startTime = Date.now(); // 요청 전 시간 기록
    axiosInstance
    .get(`/api/items?${queryString}`)
    .then((res) => {
      const endTime = Date.now(); // 응답 시간을 측정
      const responseTime = endTime - startTime; // 응답 시간 (밀리초)
      const delay = responseTime < 300 ? 300 - responseTime : 0; // 응답 시간이 0.5초보다 빠르면 남은 시간만큼 지연
      
      // 지연 후 응답을 출력
      setTimeout(async () => {
        setRowData(res.data);
        setLoading(false);
      }, delay);
        
    })
    .catch((error) => console.error("Error fetching data:", error));
    
  };

  // 수정
  const modifyData = (params) => {
    axiosInstance
      .put("/api/items", JSON.stringify(params))
      .then((res) => {
        getData();
      })
      .catch((error) => console.error("Error fetching data:", error));    
  };


  // 추가
  const createData = (params) => {

    // 버튼
    const test_buttons = [
        { label: "test1", className: "btn btn-sm btn-primary", onClick: ()=> alert("test1") },
        { label: "test2", className: "btn btn-sm btn-success", onClick: ()=> alert("test2") },
        { label: "test3", className: "btn btn-sm btn-danger", onClick: ()=> alert("test3") },
      ];

    const test_content = () => {
      return (
        <div className={"p-2"}>
          <div className={"p-2"}>
            <Buttons buttonData={test_buttons} align={"end"}/>
          </div>
          <div className={"p-2"}>
            <Forms
              id={"test"}
              fields={fields}
              onSearchData={handleModalData}
              direction={"vertical"}
              />
          </div>
        </div>
      );
    };

    modalRef.current.open({
      title: "추가",
      message: "추가하시겠습니까?",
      content: test_content(),
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        if(modalInputData.current.name === ""){
          modalRef2.current.open({ title:"알림", message:"이름을 입력하세요.", cancelText:"" });
          return;
        }
        
        axiosInstance
          .post("/api/items", JSON.stringify(modalInputData.current))
          .then((res) => {
            getData();
          })
          .catch((error) => console.error("Error fetching data:", error));   

        modalRef.current.close();
      },
    });

  };


  // 삭제
  const deleteData = (params) => {
    const selectRows = gridRef.current.getSelectedRows();

    if(selectRows.length === 0) {
      modalRef.current.open({ title:"알림", message:"선택된 항목이 없습니다.", cancelText:"" });
      return;
    }

    // 모달 열기
    modalRef.current.open({
      title:"삭제",
      message:"진행하시겠습니까",
      confirmText:"삭제",
      confirmClass:"btn btn-danger",
      onCancel:()=>{
        modalRef.current.close();
      },
      onConfirm:(res) => {
        // 나중에 데이터 전체 넘기고 batch 처리 필요
        selectRows.forEach( (el)=>{
          axiosInstance
          .delete(`/api/items/${el.id}`)
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => console.error("Error fetching data:", error));    
        });
      },
    });
    
  };


  // onGridReady에서 이벤트 리스너 추가
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장
    getData();

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      const params = {
        id: ev.data.id,
        name: ev.data.user_nm
      };
      modifyData(params);
      // 수정된 row 배열에 저장
      // const updateChangedRows = (row) =>{
      //   const idx = changedRowsRef.current.findIndex(el => el.id === row.id);
      //   if (idx !== -1){
      //     changedRowsRef.current[idx] = row;
      //   }
      //   else {
      //     changedRowsRef.current.push(row);
      //   }
      // } 
    });
    
    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      
    });

  };


  // 버튼스 컴포넌트 데이터 
  const buttonData = [
    { label: "조회", className: "btn btn-sm btn-primary", onClick: getData },
    { label: "추가", className: "btn btn-sm btn-success", onClick: createData },
    { label: "삭제", className: "btn btn-sm btn-danger", onClick: deleteData },
  ];

 
  return (
    <div>
      <div className="py-2 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="py-2">
          <Forms
            id={"news"}
            fields={fields}
            onSearchData={handleSearchData}
            direction={"horizontal"}
          />
        </div>
        <div className="py-2">
          <Buttons buttonData={buttonData}/>
        </div>
      </div>
      
      <div style={{height:"79vh"}}>
        <GridExample 
          columnDefs={columnDefs}
          rowData={rowData}
          onGridReady={onGridReady} 
          loading={loading}
          rowNum={true}
          rowSel={"singleRow"}
        />
      </div>

      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />
    </div>
  );
}

export default News;

import React, { useMemo, useCallback } from "react";

import { AgGridReact } from "ag-grid-react";
// Register all Community features
import { AllCommunityModule, ModuleRegistry, themeQuartz, themeAlpine, themeBalham  } from "ag-grid-community";
import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';

ModuleRegistry.registerModules([AllCommunityModule]);

const GridExample = ( {columnDefs, rowData, loading=false, rowNum=false, rowSel="singleRow", onGridReady=null, pagination=true, pageSize=25, rowDrag=false, pinnedBottomRowData=[], rowStyle=null, rowClass=null} ) => {

  // 테마설정
  const myTheme = themeQuartz  // themeQuartz, themeAlpine, themeBalham 
  .withParams({
    borderRadius: 0,
    browserColorScheme: "inherit",
    columnBorder: true,
    fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Oxygen-Sans",
        "Ubuntu",
        "Cantarell",
        "Helvetica Neue",
        "sans-serif"
    ],
    fontSize: 12,
    headerFontSize: 12,
    headerFontWeight: 700,
    headerRowBorder: true,
    oddRowBackgroundColor: "#FaFaFa",
    rowBorder: true,
    spacing: 4,
    wrapperBorder: true,
    wrapperBorderRadius: 0
  });


  // 기본 설정 추가 = rowNum, editable: false일때 배경색
  const enchancedColumnDefs = useMemo(() => {
    let newColumnDefs = [];
    let rownumCol = { 
      headerName: "No.", 
      field:"rownum",
      sortable: false, 
      valueGetter: (params) => !params.node.rowPinned ?params.node.rowIndex + 1 : '', 
      minWidth:40,
      maxWidth:80,
      width: 60,
      align: "center",
      rowDrag:rowDrag
    };

    if(rowNum){
      newColumnDefs = [rownumCol, ...columnDefs];
    }
    else{
      newColumnDefs = columnDefs;
    }

    // editable: false = background color set , text align
    return newColumnDefs.map((col) => ({
      ...col,
      cellStyle: (params) => {
        let bgColor = '';

        // 1. editable일 경우 기본 배경
        if (!params.node.rowPinned && params.colDef.editable) {
          bgColor = '#a7d1ff29';
        }

        // 2. backgroundColor가 있으면 덮어쓰기
        if (params.colDef.backgroundColor) {
          bgColor = params.colDef.backgroundColor;
        }

        return {
          backgroundColor: bgColor,
          display: 'flex',
          justifyContent: params.colDef.align || 'flex-start',
          alignItems: params.colDef.align || 'center'
        };
      }
    }));

  }, [rowNum, columnDefs]);


  // 기본 설정
  const defaultColDef = useMemo(() => {
    return {
      // flex: 1,
      minWidth: 80,
      width: 120,
      filter: false,
      editable: false,
      sortable: false,
      unSortIcon: true, // 기본 정렬 아이콘 표시
      align:"center"
    };
  }, []);

  // 기본 행 스타일
  const getRowStyle = useCallback((params) => {
    if (params.node.rowPinned) {
      return { fontWeight: "bold", backgroundColor: "white" };
    }
  }, []);
  

  // 행 선택 설정
  const rowSelection = useMemo(() => {
    const tp = rowSel === "singleRow" ? false : true;
    return { 
      mode: rowSel, // singleRow, multiRow
      headerCheckbox: true,
      checkboxes: tp,
      enableClickSelection: !tp, // singleRow일때 클릭 선택 가능
      enableSelectionWithoutKeys:true, // 같은 행 클릭시 선택,취소
      headerCheckboxSelectionFilteredOnly: true, // 필터/페이지 적용 시 보이는 것만 선택
      selectAll: 'currentPage', // 현재 페이지의 모든 행 선택
      // rowMultiSelectWithClick: false, // 일반 클릭으로는 선택 안 되게 함
      // suppressRowClickSelection: true,  // 행 클릭 시 선택 방지
    };
  },[rowSel]);

  // 행 ID 설정
  // const getRowId = useCallback((params) => params.data.idx, []);


  // 페이지 크기
  const paginationPageSizeSelector = useMemo(() => {
    const arr = [10, 25, 50, 100, 250, 500, 1000];
    if (arr.includes(pageSize)) {
      return arr; // 이미 있으면 그대로 리턴
    } else {
      return [...arr, pageSize]; // 없으면 추가해서 새 배열 리턴
    }
  }, []);


  // 페이지 포맷
  const paginationNumberFormatter = useCallback((params) => {
    return "[" + params.value.toLocaleString() + "]";
  }, []);


  // 로딩 컴포넌트
  const CustomLoadingOverlay = () => {
    return (
      <div className="ag-overlay-loading-center" role="presentation">
        <div aria-live="polite" aria-atomic="true" style={{padding:"10px"}}>
          로딩중입니다... abh
        </div>
      </div>
    )
  };


  // onGridReady 내부 핸들러 (기본 이벤트 자동 추가)
  const handleGridReady = useCallback((params) => {

    // 기본 이벤트 리스너 등록


    // 부모에서 전달한 onGridReady 실행 (있다면)
    if (onGridReady) {
      onGridReady(params);
    }
  }, [onGridReady]);



  // 스타일
  const containerStyle = useMemo(() => ({ flex: 1, width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  
  
  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        <AgGridReact
          theme={myTheme}
          localeText={AG_GRID_LOCALE_KR}
          rowData={rowData}
          loading={loading}
          defaultColDef={defaultColDef}
          columnDefs={enchancedColumnDefs}
          rowSelection={rowSelection}
          // getRowId={getRowId}
          rowModelType={"clientSide"}
          onGridReady={handleGridReady}
          // ref={gridRef}
          // onGridReady={(params) => {
          //   gridRef.current.api = params.api;
          //   gridRef.current.columnApi = params.columnApi;
          //   handleGridReady(params);
          // }}
        
          // paginationAutoPageSize={true}
          pagination={pagination}
          paginationPageSize={pageSize}
          paginationPageSizeSelector={paginationPageSizeSelector}
          paginationNumberFormatter={paginationNumberFormatter}

          loadingOverlayComponent={CustomLoadingOverlay}

          rowDragManaged={rowDrag}
          pinnedBottomRowData={pinnedBottomRowData}
          getRowStyle={rowStyle}
          getRowClass={rowClass}
        />
      </div>
    </div>
  );

};

export default GridExample;

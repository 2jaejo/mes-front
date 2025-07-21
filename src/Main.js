import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom'; // v6: Routes와 Route 사용

// 로고
// import logo from "./logo.svg";

// 레이아웃
// import Header from "./layout/Header";
import Navi from "./layout/Navi";
// import Aside from "./layout/Aside";
// import Article from "./layout/Article";
// import Footer from "./layout/Footer";

// 컴포넌트
// import FloatingButton from "./components/FloatingButton";
import TabList from "./components/TabList";
import TabContent from "./components/TabContent";

// 유틸
import { setupAxiosInterceptor } from "utils/Axios";
// import { GlobalContext } from "utils/GlobalContext";
import axiosInstance from "utils/Axios";

// 홈
import Home from "pages/Home";

// 페이지 컴포넌트 전체 호출
import PageComponent from 'utils/loadPageComponents';

function Main() {
  const navigate = useNavigate();
  // 인터셉터 설정
  React.useEffect(() => {
    setupAxiosInterceptor(navigate);
  }, [navigate]);


  // const { sidebar, toggleSidebar } = useContext(GlobalContext);
  // const { isTab } = useContext(GlobalContext);

  // 확장된 메뉴를 추적하는 상태
  // const [expandedMenu, setExpandedMenu] = useState(["menu1"]);

  // 메뉴 리스트
  const [navMenuList, setNavMenuList] = useState([]);

  // 메뉴 항목 확장/축소 토글 함수
  // const handleMenuToggle = (menu) => {
  //   setExpandedMenu(
  //     expandedMenu.includes(menu)
  //       ? expandedMenu.filter((item) => item !== menu)
  //       : [...expandedMenu, menu]
  //   );
  // };

  // 탭 추가
  const addTab = useCallback((menu, title) => {
    
    const exists = tabs.some(item => item.id === menu);
    if (!exists) {
      // 탭이 15개 이상일 경우 추가 불가
      if(tabs.length > 15) {
        alert("탭은 최대 15개까지 열 수 있습니다.");
        return;
      }

      const content = getTabContent(menu);
      if (!content) {
        alert("탭 내용을 불러오지 못했습니다.");
        return;
      }
      
      setTabs(prev => [...prev, { id: menu, title }]); // 새로운 탭 추가
      setTabContents(prev => ({
        ...prev,
        [menu]: content,
      }));
    }
    setActiveTab(menu); // 새 탭 활성화
  });



  // 탭 리스트
  const [tabs, setTabs] = useState([{id:"Home",title:"홈"}]);
  // 탭 활성화
  const [activeTab, setActiveTab] = useState("Home");

  // 탭 내용 - Home 기본값
  const [tabContents, setTabContents] = useState({ Home: <Home addTab={addTab}/> });



  // 탭 삭제
  const removeTab = (menu) => {
    const updatedTabs = tabs.filter((tab) => tab.id !== menu);
    setTabs(updatedTabs); // 탭 제거
    // 현재 활성화된 탭이 닫힌 경우, 다른 탭을 활성화
    if (activeTab === menu) {
      setActiveTab(updatedTabs.length > 0 ? updatedTabs.at(-1).id : null);
    }
  };

  // 첫 번째 탭 제외 모두 삭제
  const removeAllExceptFirstTab = () => {
    if (tabs.length <= 1) return; // 탭이 1개 이하면 삭제할 게 없음

    const firstTab = tabs[0];
    setTabs([firstTab]); // 첫 번째 탭만 유지

    // 현재 탭이 삭제된 탭 중 하나였다면 첫 번째 탭으로 활성화 변경
    if (activeTab !== firstTab.id) {
      setActiveTab(firstTab.id);
    }
  };

  // 탭에 맞는 컴포넌트를 렌더링하는 함수
  const getTabContent = (menu) => {
    const Component = PageComponent[menu];
    return Component ? <Component /> : <div>존재하지 않는 탭입니다.</div>;
  };




  useEffect(() => {
    // 메뉴리스트 조회
    axiosInstance
    .get(`/api/getMenuList`)
    .then((res) => {
      const menus = res.data; 
      const menuTree = [];
      const menuMap = {};
      
      menus.forEach(menu => {
        menu.children = [];
        menuMap[menu.menu_id] = menu;

        if (!menu.parent_id) {
          menuTree.push(menu); // 대분류
        } else {
          const parent = menuMap[menu.parent_id];
          if (parent) {
            parent.children.push(menu); // 소분류
          }
        }
      });

      // 메뉴 트리에서 대분류와 소분류를 추출하여 새로운 배열 생성
      const arr = [];
      menuTree.forEach((el) => {
        const obj = {
          title: el.menu_nm,
          subMenu: [],
          subMenu2: [],
        };
        el.children.forEach((el2) => {
          obj.subMenu.push(el2.menu_nm);
          obj.subMenu2.push(el2.menu_id);
        });
        arr.push(obj);
      });

      setNavMenuList(arr);

      

    })
    .catch((error) => {
      
    });   

  }, []);

  
  // const menuList = [
  //   {
  //     title: '기준정보관리',
  //     subMenu: ['분류관리', '품목관리', '단가관리', '거래처관리', '공정관리', '설비관리', '설비점검항목관리', '라우터관리', 'BOM관리'],
  //     subMenu2: [ "CategoryMgmt", "ItemMgmt", "PriceMgmt", "VendorMgmt", "ProcessMgmt", "EquipmentMgmt", "EquipmentCheckMgmt", "RouterMgmt", "BomMgmt"],
  //   },
  //   {
  //     title: '자재관리',
  //     subMenu: ['발주관리', '구매입고관리', '기타입고관리', '입고반품관리', '입고이력', '공정출고관리', '기타출고관리', '출고환입관리', '출고이력'],
  //     subMenu2: ['OrderMgmt', 'PurchaseReceiveMgmt', 'EtcReceiveMgmt', 'ReceiveReturnMgmt', 'ReceiveHistory', 'ProcessReleaseMgmt', 'EtcReleaseMgmt', 'ReleaseReturnMgmt', 'ReleaseHistory'],
  //   },
  //   {
  //     title: '재고관리',
  //     subMenu: ['재고조회', '재고조정'],
  //     subMenu2: ['InventoryLookup', 'InventoryAdjust'],
  //   },
  //   {
  //     title: '영업관리',
  //     subMenu: ['수주관리'],
  //     subMenu2: ['SalesOrderMgmt'],
  //   },
  //   {
  //     title: '생산관리',
  //     subMenu: ['작업지시관리', '작업실적관리', '설비점검관리'],
  //     subMenu2: ['WorkOrderMgmt',    'WorkResultMgmt',    'EquipmentInspectionMgmt'],
  //   },
  //   {
  //     title: '제품재고관리',
  //     subMenu: ['입고(실적)취소관리', '출고취소관리', '제품출고관리', '제품재고관리', '제품입고이력', '제품출고이력'],
  //     subMenu2: ['ReceiveCancelMgmt',    'ReleaseCancelMgmt',    'ProductReleaseMgmt',    'ProductInventoryMgmt',    'ProductReceiveHistory',    'ProductReleaseHistory'],
  //   },
  //   {
  //     title: '모니터링',
  //     subMenu: ['생산계획', '성능가동률', '설비별현황'],
  //     subMenu2: ['ProductionPlan',    'PerformanceOperationRate',    'EquipmentStatusByUnit'],
  //   },
  //   {
  //     title: '시스템관리',
  //     subMenu: ['화면관리', '회원관리', '개인정보관리', '접속이력관리'],
  //     subMenu2: ['ScreenMngt', 'MemberMngt', 'MyPage', 'LoginHistory'],
  //   },
  //   {
  //     title: 'POP',
  //     subMenu: ['작업지시조회', '양품(실적)등록', '불량등록', '작업시작', '작업종료'],
  //     subMenu2: ['WorkOrderLookup',    'GoodProductRegister',    'DefectRegister',    'WorkStart',    'WorkEnd'],
  //   },
  // ];




  return (
    <div className="contianer">
      {/* 사이드바 토글버튼 */}
      {/* <FloatingButton onClick={toggleSidebar} isOpen={sidebar.isOpen} state={sidebar.isDesktop}/> */}


      <div className="main">
        {/* 헤더 */}
        {/* <Header /> */}

        {/* 내비게이션 */}
        <Navi menu={navMenuList} addTab={addTab} />

        {/* 메뉴리스트 */}
        {/* <Sidebar content={sidebar_content()}/> */}

        {/* 메인화면 */}
        <div className="article">
          <div className="wrapper">
            <TabList
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              removeTab={removeTab}
              removeAllTab={removeAllExceptFirstTab}
            />
            <TabContent
              tabs={tabs}
              activeTab={activeTab}
              tabContents={tabContents}
            />
          </div>
        </div>

        {/* 푸터 */}
        {/* <Footer /> */}
      </div>
    </div>
  );
}

export default Main;

import React from 'react';

const TabContent = ({ tabs, activeTab, tabContents }) => {
  return (
    <div className="tab-content">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const element = tabContents[tab.id];

        return (
          <div
            key={tab.id}
            className={`tab-pane ${isActive ? 'visible' : 'hidden'}`}
          >
            {React.isValidElement(element)
              ? React.cloneElement(element, { isActive })  // 여기서 props 전달
              : element}
          </div>
        );
      })}
      {/* {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab-pane ${activeTab === tab.id ? 'visible' : 'hidden'}`}
        >
          {tabContents[tab.id]}
        </div>
      ))} */}
    </div>
  );
};

export default TabContent;

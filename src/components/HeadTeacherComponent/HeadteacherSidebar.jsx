"use client";

export default function HeadteacherSidebar({ activeTab, setActiveTab }) {
  return (
    <>
      {/* Offcanvas (mobile) */}
      <div
        className="offcanvas offcanvas-start d-lg-none"
        tabIndex="-1"
        id="sidebarOffcanvas"
        aria-labelledby="sidebarOffcanvasLabel"
      >
        <div className="offcanvas-header">
          <h5 id="sidebarOffcanvasLabel">Menu</h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="d-flex flex-column">
            {["teachers", "learners", "remarks", "reports"].map((tab) => (
              <button
                key={tab}
                className={`sidebar-btn mb-2 ${
                  activeTab === tab ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab)}
                data-bs-dismiss="offcanvas"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Static Sidebar (desktop) */}
      <aside className="sidebar d-none d-lg-flex flex-column p-3">
        {["teachers", "learners", "remarks", "reports"].map((tab) => (
          <button
            key={tab}
            className={`sidebar-btn mb-2 ${
              activeTab === tab ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </aside>
    </>
  );
}

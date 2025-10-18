"use client";

export default function GalleryPage() {
  const galleryItems = [
    {
      id: 1,
      img: "/imgs/school logo.png",
      title: "Classroom Learning",
      desc: "Modern classrooms designed for interactive learning.",
    },
    {
      id: 2,
      img: "/imgs/school logo.png",
      title: "Science Lab",
      desc: "Hands-on experiments fostering curiosity and innovation.",
    },
    {
      id: 3,
      img: "/imgs/school logo.png",
      title: "Sports Activities",
      desc: "Encouraging teamwork and physical wellness through sports.",
    },
    {
      id: 4,
      img: "/imgs/school logo.png",
      title: "Cultural Events",
      desc: "Celebrating diversity and creativity in our community.",
    },
  ];

  return (
    <section className="mb-5 shadow-sm mt-3 rounded-3 login-card">
      <div className="container pb-5">
        <h2 className="fw-bold text-center mb-4">School Gallery</h2>
        <div className="row g-4">
          {galleryItems.map((item) => (
            <div key={item.id} className="col-lg-3 col-sm-12">
              <div className="gallery-card d-flex align-items-center p-3">
                <img
                  src={item.img}
                  alt={item.title}
                  className="gallery-img me-3"
                />
                <div>
                  <h5 className="fw-semibold">{item.title}</h5>
                  <p className="mb-0 small">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

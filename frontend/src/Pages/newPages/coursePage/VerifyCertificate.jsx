import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const VerifyCertificate = () => {
  const { certificateId } = useParams(); // Extract certificateId from URL
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}certificate/verify/${certificateId}`
        );

        if (response.data.success) {
          setCertificate(response.data.certificate); // Set the certificate data
        } else {
          setError("Certificate not found.");
        }
      } catch (err) {
        setError("Error fetching certificate details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  if (loading) return <div>Loading certificate details...</div>;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {error ? (
        <div style={{ color: "red" }}>
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      ) : (
        <div
          style={{
            fontFamily: "'Times New Roman', Times, serif",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#dce6f0", // Light blue
          }}
        >
          <div
            style={{
              position: "relative",
              width: "90%",
              maxWidth: "1000px",
              height: "600px",
              backgroundColor: "white",
              border: "5px solid #4682b4", // Steel blue border
              borderRadius: "10px",
              padding: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Decorative Circle */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                width: "50px",
                height: "50px",
                backgroundColor: "#4682b4", // Steel blue
                borderRadius: "50%",
              }}
            ></div>
  
            {/* Title */}
            <h1
              style={{
                textAlign: "center",
                fontSize: "30px",
                color: "#4682b4", // Steel blue
                fontWeight: "bold",
              }}
            >
              Certificate of Completion
            </h1>
  
            {/* Subtitle */}
            <p
              style={{
                textAlign: "center",
                fontSize: "14px",
                fontStyle: "italic",
                color: "#3c3c3c", // Dark gray
              }}
            >
              This certifies that
            </p>
  
            {/* User Name */}
            <h2
              style={{
                textAlign: "center",
                fontSize: "24px",
                color: "#4682b4", // Steel blue
                fontWeight: "bold",
              }}
            >
              {certificate.username}
            </h2>
  
            {/* Course Completion Text */}
            <p
              style={{
                textAlign: "center",
                fontSize: "14px",
                fontStyle: "italic",
                color: "#3c3c3c",
              }}
            >
              has successfully completed the course:
            </p>
  
            {/* Course Name */}
            <h3
              style={{
                textAlign: "center",
                fontSize: "18px",
                color: "#4682b4", // Steel blue
                fontWeight: "bold",
              }}
            >
              {certificate.courseName}
            </h3>
  
            {/* Date and Certified By */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0 20px",
              }}
            >
              <p style={{ fontSize: "12px" }}>Date: {certificate.dateIssued}</p>
              <p style={{ fontSize: "12px", textAlign: "right" }}>
                Certified by: PHC Institute
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default VerifyCertificate;

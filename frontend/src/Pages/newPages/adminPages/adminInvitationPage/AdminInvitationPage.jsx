import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import GeneralNavbar from "../../../../components/navbar/GeneralNavbar";
import BlobComposition from "../../../../components/backgrounds/BlobComposition/BlobComposition";
import { SiGooglesheets } from "react-icons/si";
import axios from "axios";
import Pagination from "../../Profile/Pagination";

const AdminInvitationPage = () => {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]); // Track selected files for deletion
  const itemsPerPage = 5;
  const authUser = useSelector((state) => state.user);
  const navigate = useNavigate();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}api/students/files`
      );
      console.log("Fetched files:", response.data);
      setFiles(response.data);

    } catch (error) {
      console.error("Error fetching uploaded files:", error);
      alert("Failed to fetch uploaded files.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel")
    ) {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid Excel file (.xlsx or .xls)");
      e.target.value = null;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    console.log(formData);

    try {

      const institutionCode = authUser?.institution?.code;

      if (!institutionCode) {
        alert("Institution code is required.");
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}api/students/uploads?institutionCode=${institutionCode}`,

        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("File uploaded successfully!");
      setFile(null);
      fetchUploadedFiles();
    } catch (error) {
      console.error("Error uploading file:", error.response || error);
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred during file upload.";
      alert(`Failed to upload file: ${errorMessage}`);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) {
      alert("No files selected for deletion.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete the selected files?")) {
      return;
    }

    try {
      for (const fileId of selectedFiles) {
        await axios.delete(`${process.env.REACT_APP_API_URL}api/students/files/${fileId}`);
      }

      alert("Selected files deleted successfully.");
      setSelectedFiles([]);
      fetchUploadedFiles();
    } catch (error) {
      console.error("Error deleting files:", error.response || error);
      alert(
        `Failed to delete files: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles((prevSelectedFiles) =>
      prevSelectedFiles.includes(fileId)
        ? prevSelectedFiles.filter((id) => id !== fileId)
        : [...prevSelectedFiles, fileId]
    );
  };

  const currentFiles = files.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="relative h-full">
      <GeneralNavbar />
      <BlobComposition
        blobsData={[
          { top: "10%", left: "-20%", size: "700px" },
          { top: "-30%", left: "70%", size: "400px" },
          { top: "40%", left: "50%", size: "300px" },
        ]}
      />

      <div className="m-auto max-w-[1200px] mt-3 min-h-[100vh]">
        <div className="bg-white rounded-full flex justify-between items-center py-2 px-4">
          <p className="font-semibold text-lg">Uploaded Files</p>
          <div className="flex items-center space-x-3">
            <label className="flex items-center hover:bg-green-50 bg-green-100 cursor-pointer px-3 py-1 hover:scale-[1.05] transition-all rounded-full">
              <span className="text-sm mr-1 font-medium text-green-500">
                Upload Excel File
              </span>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                style={{ display: "none" }}
              />
              <SiGooglesheets className="text-green-500" />
            </label>
            <button
              onClick={handleUpload}
              disabled={!file}
              className={`${
                file
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-green-300 cursor-not-allowed"
              } text-white px-4 py-1 rounded-full font-medium transition-all`}
            >
              Upload
            </button>
            <button
              onClick={handleDeleteSelected}
              className="bg-red-500 text-white px-3 py-1 rounded-full font-medium transition-all hover:bg-red-600"
            >
              Delete Selected
            </button>
          </div>
        </div>

        <div className="bg-white py-2 px-4 my-3 rounded-lg">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedFiles(
                        e.target.checked ? files.map((file) => file._id) : []
                      )
                    }
                    checked={
                      selectedFiles.length === files.length &&
                      files.length > 0
                    }
                  />
                </th>
                <th className="text-left">File Name</th>
                <th className="text-left">Uploaded On</th>
                <th className="text-left">Total Students</th>
                <th className="text-left"></th>
              </tr>
            </thead>
            <tbody>
              {currentFiles.map((file, index) => (
                <tr key={index} className="border-b">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file._id)}
                      onChange={() => toggleFileSelection(file._id)}
                    />
                  </td>
                  <td className="py-2">{file.fileName}</td>
                  <td className="py-2">{new Date(file.uploadedOn).toLocaleString()}</td>
                  <td className="py-2">{file.students ? file.students.length : 0}</td>
                  <td className="py-2 flex space-x-2">
                    <button
                      onClick={() => navigate(`/uploads/${file._id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-full font-medium"
                    >
                      View Students
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            totalPages={Math.ceil(files.length / itemsPerPage)}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {files.length === 0 && (
          <div className="text-center py-4 text-gray-500">No files uploaded yet.</div>
        )}
      </div>
    </div>
  );
};

export default AdminInvitationPage;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GeneralNavbar from "../../../../components/navbar/GeneralNavbar";
import BlobComposition from "../../../../components/backgrounds/BlobComposition/BlobComposition";
import { FaSortAlphaDownAlt } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { SiGooglesheets } from "react-icons/si";
import axios from "axios";
import { useAuth } from "../../../../context/auth-context";
import { useSelector } from "react-redux";
import Pagination from "../../Profile/Pagination";

const XLSX = require('xlsx');

const AdminInvitationPage = () => {
  const [students, setStudents] = useState([]);
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [institutionCode, setInstitutionCode] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Limit per page

  const authUser = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { type } = useParams();

  
 

  useEffect(() => {
    if (!type) {
      navigate("/admin");
    }
    if (authUser?.institution?.code) {
      setInstitutionCode(authUser.institution.code); // Set the institution code dynamically
      console.log(authUser.institution.code);
    }
  }, [type]);


  useEffect(() => {
    if (institutionCode) {
      fetchStudents();
      console.log("Institution Code:", institutionCode);  //check if it finds institution code
    }
  }, [institutionCode]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_URL + `api/students/${institutionCode}`);
      const fetchedStudents = response.data;
  console.log(fetchedStudents);
      setStudents(fetchedStudents); // Update the students state
      setTotalPages(Math.ceil(fetchedStudents.length / itemsPerPage)); // Calculate total pages
      setCurrentPage(1); // Reset to the first page
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Failed to fetch students list");
    }
  };
  

  const handleFileChange = (e) => {
 
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      selectedFile.type === "application/vnd.ms-excel")) {
      setFile(selectedFile);
      console.log("uploaded");
    } else {
      alert("Please upload a valid Excel file (.xlsx or .xls)");
      e.target.value = null;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + `api/students/upload?institutionCode=${institutionCode}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      const { students: newStudents } = response.data;
  
      // Append new students to the existing list
      setStudents((prevStudents) => {
        const updatedStudents = [...prevStudents, ...newStudents];
        setTotalPages(Math.ceil(updatedStudents.length / itemsPerPage)); // Recalculate total pages
        return updatedStudents;
      });
  
      alert("Upload successful!");
    } catch (error) {
      console.error("Error uploading file:", error);
  
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Failed to upload file. Please try again.");
      }
    }
  };
  
  const handleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };
  
  const filteredStudents = students.filter((student) => {
    if (filterStatus !== "All" && student.status !== filterStatus) return false;
    if (!student.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const sortedStudents = filteredStudents.sort((a, b) => {
    return sortDirection === "asc" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
  });

  // Update pagination dynamically
  useEffect(() => {
    setTotalPages(Math.ceil(sortedStudents.length / itemsPerPage));
    if (currentPage > Math.ceil(sortedStudents.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [sortedStudents, currentPage]);

  // Paginate sorted and filtered students
  const currentStudents = sortedStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );



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
          <p className="font-semibold text-lg">
            Invite {`${type === "students" ? "Students" : "Teachers"}`}
          </p>
          <div className="flex items-center space-x-3">
            <label className="flex items-center hover:bg-green-50 bg-green-100 cursor-pointer px-3 py-1 hover:scale-[1.05] transition-all rounded-full">
              <span className="text-sm mr-1 font-medium text-green-500">Upload your Excel</span>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
              />
              <SiGooglesheets className="text-green-500" />
            </label>
            <button
              onClick={handleUpload}
              disabled={!file}
              className={`${file ? 'bg-green-500 hover:bg-green-600' : 'bg-green-300 cursor-not-allowed'
                } text-white px-4 py-1 rounded-full font-medium transition-all`}
            >
              Upload
            </button>
          </div>
        </div>

        <div className="bg-white rounded-full flex justify-between items-center py-2 px-4 mt-2">
          <p className="font-semibold text-lg">Invitations</p>
          <div className="flex items-center space-x-3">
          <select
              value={filterStatus}
              onChange={handleFilterStatusChange}
              className="text-sm border px-2 py-1 rounded-full"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
            </select>
            <button
              onClick={handleSort}
              className="cursor-pointer hover:bg-stone-100 p-2 rounded-full transition-all"
              aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
            >
              <FaSortAlphaDownAlt className={`text-stone-800 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex items-center">
              <input
                placeholder="Search by email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm focus:outline-none focus:border-b-stone-400 border-b-transparent border-b-[1.5px] pr-2 py-1 font-medium text-stone-600"
              />
              <IoMdSearch />
            </div>
          </div>
        </div>

        <div className="bg-white py-2 px-4 my-3 rounded-lg">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="text-left">Email</th>
                <th className="text-left">Sent on</th>
                <th className="text-end">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="text-sm">
  {currentStudents.map((student, index) => (
    <tr key={index} className="border-b">
      <td className="py-2">{student.email}</td>
      <td className="py-2">{new Date(student.sentOn).toLocaleString()}</td>
      <td className="py-2">
        <div className="flex justify-end">
          <div
            className={`px-2 py-1 text-sm flex items-center justify-center ${
              student.status === "Accepted" ? "bg-green-500" : "bg-yellow-500"
            } rounded-full`}
          >
            <p
              className={`font-medium ${
                student.status === "Accepted" ? "text-green-100" : "text-yellow-100"
              }`}
            >
              {student.status}
            </p>
          </div>
        </div>
      </td>
    </tr>
  ))}
</tbody>
          </table>
          <Pagination
  totalPages={totalPages}
  currentPage={currentPage}
  onPageChange={(page) => setCurrentPage(page)}
/>
          {sortedStudents.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No students found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInvitationPage;
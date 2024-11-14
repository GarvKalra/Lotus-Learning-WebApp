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


const AdminInvitationPage = () => {
  const [students, setStudents] = useState([]);
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [institutionCode, setInstitutionCode] = useState(null);

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
      const response = await axios.get(`http://localhost:5001/api/students/${institutionCode}`);
      setStudents(response.data);
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
    formData.append('file', file);
  
    
    console.log("uploaded");
    try {
    
      const response = await axios.post(`http://localhost:5001/api/students/upload?institutionCode=${institutionCode}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(response.data.message);
      fetchStudents(); // Refresh the list after upload
      setFile(null); // Reset file input
    } catch (error) {
      console.error(error);
      alert('Failed to upload students.');
    }
  };
  //const existingStudents = getStudents;             await axios.get('/admin/get-students'); // for getting all users from mongo

  const handleStudentLogin = async () => {
    // if (!institutionCode) {
    //   alert("Institution code is missing.");
    //   return;
    // }
    try {
      // Get invited students
      const studentsInvited = await axios.get('http://localhost:5001/api/students');
      console.log("Invited students:", studentsInvited.data);

      // Get existing students
      const code = institutionCode;
      console.log(code);
      const existingStudentsResponse = await axios.post('http://localhost:5001/admin/get-students', { code });
      const existingStudents = existingStudentsResponse.data;
      console.log("Existing students:", existingStudents.data);

      // Update status for matching students
      for (const invitedStudent of studentsInvited.data) {
        // Check if the invited student's email exists in existing students
        const matchingStudent = existingStudents.data.find(
          existingStudent => existingStudent.email === invitedStudent.email
        );

        if (matchingStudent) {
          try {
            console.log(`Updating status for ${invitedStudent.email}`);

            const response = await axios.post(
              'http://localhost:5001/api/students/update-status',
              // { email: invitedStudent.email }
            );

            if (response.data.success) {
              console.log(`Status updated to 'accepted' for ${invitedStudent.email}`, response.data);
            } else {
              console.error(`Failed to update status for ${invitedStudent.email}:`, response.data.error);
            }
          } catch (updateError) {
            console.error(`Error updating status for ${invitedStudent.email}:`,
              updateError.response?.data || updateError.message
            );
          }
        } else {
          console.log(`No matching existing student found for ${invitedStudent.email}`);
        }
      }

      // Refresh the students list after updates
      await fetchStudents();
      console.log("Student list refreshed after updates");

    } catch (error) {
      console.error('Error in bulk status update:', error);
      if (error.response?.status === 404) {
        alert('Unable to fetch students. Please check if the API is running.');
      } else {
        alert('An error occurred while updating student statuses. Please try again.');
      }
    }
  };

  const handleSort = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    const sortedStudents = [...students].sort((a, b) => {
      if (newDirection === "asc") {
        return a.email.localeCompare(b.email);
      }
      return b.email.localeCompare(a.email);
    });
    setStudents(sortedStudents);
  };

  const filteredStudents = students.filter(student =>
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log(filteredStudents);

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
              {filteredStudents.map((student) => (
                <tr key={student.email} className="border-b">
                  <td className="py-2">{student.email}</td>
                  <td className="py-2">{new Date(student.sentOn).toLocaleString()}</td>
                  <td className="py-2">
                    <div className="flex justify-end">
                      <div className={`px-2 py-1 text-sm flex items-center justify-center ${student.status === "accepted" ? "bg-green-500" : "bg-yellow-500"} rounded-full`}>
                        <p className={`font-medium ${student.status === "Accepted" ? "text-green-100" : "text-yellow-100"}`}>
                          {student.status}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end">
                      {student.status === "Pending" && (
                        <button
                          onClick={() => handleStudentLogin()}
                          className="bg-blue-500 text-white px-4 py-1 rounded-full font-medium hover:bg-blue-600 transition-all">
                          Check Status
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
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

import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { AiFillFileImage } from "react-icons/ai";
import updateCourseDataProxy from "../../../../BackendProxy/courseProxy/updateCourseData"; // Adjust import path if needed
import { useSelector } from "react-redux";
import axios from "axios";

const CreateEditHome = ({ courseData, setCourseData }) => {
  const authUser = useSelector((state) => state.user);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseImage, setCourseImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [complexity, setComplexity] = useState("");

 
  
  const resizeImage = (file, width, height) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
  
      reader.onload = (event) => {
        img.src = event.target.result;
      };
  
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        canvas.width = width;
        canvas.height = height;
  
        // Draw the resized image on canvas
        ctx.drawImage(img, 0, 0, width, height);
  
        // Convert canvas to Blob
        canvas.toBlob(
          (blob) => {
            const newFile = new File([blob], file.name, { type: file.type });
            resolve(newFile);
          },
          file.type,
          0.9 // Set quality to 90%
        );
      };
  
      img.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };
  
  const handleUploadFile = async (file) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME; //Cloudinary Cloud Name
    const uploadPreset = "image_preset"; // Cloudinary Upload Preset
  
    if (!cloudName || !uploadPreset) {
      console.error("Cloudinary configuration is missing");
      return;
    }
  
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
  
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        data
      );
      console.log("Uploaded image URL:", response.data.secure_url);
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error.response?.data || error.message);
      return null;
    }
  };
  
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    console.log("test")
    if (file) {
      try {
        // Resize the image to 750x422 before uploading
        const resizedImageFile = await resizeImage(file, 750, 422);
  
        // Upload resized image
        const uploadResponse = await handleUploadFile(resizedImageFile);
  
        if (uploadResponse) {
          const { secure_url: imageUrl } = uploadResponse;
  
          setCourseData((prevState) => ({
            ...prevState,
            imageUrl: imageUrl,
          }));
  
          console.log(`Image uploaded successfully with name: ${resizedImageFile.name}`);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };


  const resetValues = () => {
    setCourseTitle("");
    setCourseDesc("");
    setCategories([]);
    setCourseData((prevState) => ({ ...prevState, image: null }));
  };

  //save - create new course

  
const updateCategories = (newCategoriesValue) => {
  setCourseData(prevState => ({
    ...prevState,
    categories: newCategoriesValue
  }));
};


  useEffect(() => {
    console.log(courseData);
  }, [setCourseData]);

  return (
    <div className="p-3 bg-white">
      <div className="mb-4">
        <p className="font-semibold text_linearGradient_ver1 text-lg">
          Your Course Homepage
        </p>
      </div>
      <div>
        {/* Course Title Input */}
        <div>
          <p className="font-semibold mb-1">Course Title</p>
          <input
            placeholder="Enter your course name"
            className="focus:outline-none p-2 border w-full"
            value={courseData.title}
            onChange={(e) =>
              setCourseData((prevState) => ({
                ...prevState,
                title: e.target.value,
              }))
            }
          />
          <p className="text-xs font-ligth text-stone-400 mt-1">
            Your title should be clear but eye-catching, attention-grabbing and
            optimized for search.
          </p>
        </div>

        {/* Course Description Textarea */}
        <div className="mt-4">
          <p className="font-semibold mb-1">Course Description</p>
          <textarea
            rows="6"
            placeholder="Enter your course description..."
            className="focus:outline-none p-2 border w-full"
            value={courseData.description}
            onChange={(e) => {
              if (e.target.value.split(" ").length > 200) {
                return;
              }
              setCourseData((prevState) => ({
                ...prevState,
                description: e.target.value,
              }))
            }}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs font-ligth text-stone-400">
              50 words minimum 200 maximum.
            </p>
            <p className="text-xs font-ligth text-stone-800">
              {courseDesc.split(" ").length}
            </p>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mt-3">
          <p className="font-semibold mb-1">Categories</p>
          <CourseCategories
            categories={courseData.categories}
            setCategories={updateCategories}
          />
          <p className="text-xs font-ligth text-stone-400 mt-1">
            1 category minimum 5 maximum.
          </p>
        </div>

        <div className="my-4" style={{ userSelect: "none" }}>
          <div className="flex items-center justify-between">
            <p className="font-semibold mb-1">Complexity </p>
            <p className=" mb-1 text_linearGradient_ver1">{complexity}</p>
          </div>
          <ComplexBar setComplexity={setComplexity} complex={courseData.age} />
          <p className="text-xs font-ligth text-stone-400 mt-2">
            Define the level of complexity for your course.
          </p>
        </div>

        {/* Course Image Section */}
        <div className="mt-3" style={{ userSelect: "none" }}>
          <p className="font-semibold mb-1">Course Image</p>
          <div className="border lg:h-[211px] lg:w-[375px] h-[151px] w-[275px] flex items-center justify-center">
            {courseData.imageUrl ? (
              <img
                src={courseData.imageUrl}
                alt="Selected Image"
                className="object-cover h-full w-full"
              />
            ) : (
              <AiFillFileImage className="text-5xl" />
            )}
          </div>
          <div className="flex items-center space-x-2 text-stone-500 font-medium mt-2">
            <div className="relative px-2 py-1 border cursor-pointer bg-stone-50 hover:bg-stone-100">
              <input
                onChange={handleImageUpload}
                type="file"
                className="h-full w-full absolute opacity-0  cursor-pointer left-0 top-0"
              />
              <button className="">Upload Image</button>
            </div>
          </div>
          <p className="text-xs font-ligth text-stone-400 mt-1">
            750 x 422 pixels
          </p>
        </div>
      </div>
    </div>
  );
};

// CourseCategories component for managing course categories
const CourseCategories = ({ categories, setCategories }) => {
  // Predefined list of categories
  const categoriesList = [
    "Math",
    "Science",
    "IT",
    "Software",
    "Business",
    "Health",
    "Design",
  ];

  // Ref for handling clicks outside the dropdown
  const dropRef = useRef();
  // State for dropdown visibility
  const [open, setOpen] = useState(false);

  // Add a category to the selected categories
  const addCategory = (categoryToAdd) => {
    setOpen(false);
    // Check limits before adding
    if (categories.length >= 5 || categories.includes(categoryToAdd)) {
      return;
    }
    setCategories([...categories, categoryToAdd]);
  };

  // Delete a category from the selected categories
  const deleteCategory = (categoryToDelete) => {
    const indexToDelete = categories.indexOf(categoryToDelete);
    if (indexToDelete !== -1) {
      const updatedCategories = [...categories];
      updatedCategories.splice(indexToDelete, 1);
      setCategories(updatedCategories);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropRef.current && !dropRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropRef]);

  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ userSelect: "none" }}
      className="p-2 border flex items-center justify-between bg-stone-50 hover:bg-stone-100 cursor-pointer relative"
    >
      {categories && categories.length <= 0 ? (
        <p className="text-stone-400 ">Pick your categories</p>
      ) : (
        <div className="flex space-x-2">
          {categories &&
            categories.map((category, i) => {
              return (
                <div
                  onClick={() => {
                    deleteCategory(category);
                    setOpen(false);
                  }}
                  key={category + i}
                  className="text-stone-500 font-semibold px-2 border rounded-full bg-white flex items-center justify-center space-x-2"
                >
                  <p className="">{category}</p>
                  <div className="cursor-pointer">
                    <IoClose />
                  </div>
                </div>
              );
            })}
        </div>
      )}
      <div>
        <IoIosArrowDown className="text-xl" />
      </div>
      <div
        ref={dropRef}
        className={`${
          open ? "absolute" : "hidden"
        } z-30 w-full max-h-[200px] overflow-auto bg-white border top-[100%] left-0 shadow-sm`}
      >
        {categoriesList.map((item, i) => {
          return (
            <div
              onClick={() => addCategory(item)}
              className="px-2 py-1 text-stone-600 hover:bg-stone-50"
              key={item + i}
            >
              <p>{item}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ComplexBar = ({ setComplexity, complex }) => {
  const cursorRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(50);
  const [holding, setHolding] = useState(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    setHolding(true);
    const containerWidth = cursorRef.current.parentElement.offsetWidth;
    const newPosition = Math.max(
      0,
      Math.min(
        e.clientX - cursorRef.current.parentElement.offsetLeft,
        containerWidth
      )
    );
    setCursorPosition((newPosition / containerWidth) * 100);
  };

  const handleMouseUp = () => {
    setHolding(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const proximityCheck = (pointer) => {
    let distance = [];
    for (let i = 0; i <= 100; i += 25) {
      distance.push(Math.abs(pointer - i));
    }
    let smallestDistance = distance[0];
    for (let i = 1; i < distance.length; i++) {
      if (distance[i] < smallestDistance) {
        smallestDistance = distance[i];
      }
    }
    const closestPosition = distance.indexOf(smallestDistance);
    checkFinalResult(closestPosition * 25);
    return closestPosition * 25;
  };

  const checkFinalResult = (value) => {
    switch (value) {
      case 0:
        setComplexity("Easy (8-10)");
        break;
      case 25:
        setComplexity("Medium (11-13)");
        break;
      case 50:
        setComplexity("Intermediate (13-15)");
        break;
      case 75:
        setComplexity("Advanced (16-19)");
        break;
      case 100:
        setComplexity("Innovative (20+)");
        break;
      default:
        setComplexity("NaN");
        break;
    }
  };

  useEffect(() => {
    if (!holding) {
      setCursorPosition(proximityCheck(cursorPosition));
    }
  }, [cursorPosition, holding]);

  useEffect(() => {
    switch (complex) {
      case "Easy (8-10)":
        setCursorPosition(0);
        break;
      case "Medium (11-13)":
        setCursorPosition(25);
        break;
      case "Intermediate (13-15)":
        setCursorPosition(50);
        break;
      case "Advanced (16-19)":
        setCursorPosition(75);
        break;
      case "Innovative (20+)":
        setCursorPosition(100);
        break;
      default:
        setComplexity("NaN");
        break;
    }
  }, []);

  return (
    <div className="w-full h-1 bg-red-100 relative" ref={cursorRef}>
      <div
        onClick={() => setCursorPosition(0)}
        className="bg-transparent h-2 absolute w-[10%] -top-1/2 left-0 z-10 cursor-pointer flex items-center justify-start"
      >
        <div className="linearGradient_ver1 h-2 w-1 rounded-sm" />
      </div>
      <div
        onClick={() => setCursorPosition(25)}
        className="bg-transparent h-2 absolute w-[15%] -top-1/2 left-[25%] transform -translate-x-1/2 z-10 cursor-pointer flex items-center justify-center"
      >
        <div className="linearGradient_ver1  h-2 w-1 rounded-sm" />
      </div>
      <div
        onClick={() => setCursorPosition(50)}
        className="bg-transparent h-2 absolute w-[15%] -top-1/2 left-[50%] transform -translate-x-1/2 z-10 cursor-pointer flex items-center justify-center"
      >
        <div className="linearGradient_ver1  h-2 w-1 rounded-sm" />
      </div>
      <div
        onClick={() => setCursorPosition(75)}
        className="bg-transparent h-2 absolute w-[15%] -top-1/2 left-[75%] transform -translate-x-1/2 z-10 cursor-pointer flex items-center justify-center"
      >
        <div className="linearGradient_ver1  h-2 w-1 rounded-sm" />
      </div>
      <div
        onClick={() => setCursorPosition(100)}
        className="bg-transparent h-2 absolute w-[10%] -top-1/2 left-[95%] transform -translate-x-1/2 z-10 cursor-pointer flex items-center justify-end"
      >
        <div className="linearGradient_ver1  h-2 w-1 rounded-sm" />
      </div>

      {/* cursor */}
      <div
        style={{ left: cursorPosition + "%" }}
        onMouseDown={handleMouseDown}
        className="bg-transparent absolute w-[15%] top-[50%] z-20 cursor-pointer  transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      >
        <div className="linearGradient_ver1 h-4 w-3 arrow" />
      </div>
    </div>
  );
};

export default CreateEditHome;

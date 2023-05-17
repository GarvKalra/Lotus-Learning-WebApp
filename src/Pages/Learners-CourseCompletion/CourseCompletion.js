
import Header from "../../components/Header-Components/Logged-In/Header-Logged-In";

import "./CourseCompletion.css";

// Coded by T.J. Sherwood 
// Based on page C5.0 from Figma

let Badge = "ALGEBRA ii Intermediate";

function myComp(){
    return (
       

        <div className="myPage">
            <Header />

            {/* Content Container */}
            <div className="CongratsContainer">

                {/* Confetti Container */}
                <div className="confetti">
                

                </div>

                {/* Badge Container */}
                <div className="myBadgeContainer">
                    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="100" cy="100" r="100" fill="#D9D9D9"/>
                        <line x1="29.3536" y1="28.6464" x2="170.775" y2="170.068" stroke="#CCCCCC"/>
                        <line y1="-0.5" x2="200" y2="-0.5" transform="matrix(-0.707107 0.707107 0.707107 0.707107 170.422 29)" stroke="#CCCCCC"/>
                        <path d="M76.152 105V93.3636H80.8111C81.6671 93.3636 82.3812 93.4905 82.9531 93.7443C83.5251 93.9981 83.955 94.3504 84.2429 94.8011C84.5308 95.2481 84.6747 95.7633 84.6747 96.3466C84.6747 96.8011 84.5838 97.2008 84.402 97.5455C84.2202 97.8864 83.9702 98.1667 83.652 98.3864C83.3376 98.6023 82.9777 98.7557 82.5724 98.8466V98.9602C83.0156 98.9792 83.4304 99.1042 83.8168 99.3352C84.2069 99.5663 84.5232 99.8902 84.7656 100.307C85.008 100.72 85.1293 101.212 85.1293 101.784C85.1293 102.402 84.9759 102.953 84.669 103.438C84.366 103.919 83.9171 104.299 83.3224 104.58C82.7277 104.86 81.9948 105 81.1236 105H76.152ZM78.6122 102.989H80.6179C81.3035 102.989 81.8035 102.858 82.1179 102.597C82.4323 102.331 82.5895 101.979 82.5895 101.54C82.5895 101.218 82.5118 100.934 82.3565 100.688C82.2012 100.441 81.9796 100.248 81.6918 100.108C81.4077 99.9678 81.0687 99.8977 80.6747 99.8977H78.6122V102.989ZM78.6122 98.233H80.4361C80.7732 98.233 81.0724 98.1742 81.3338 98.0568C81.599 97.9356 81.8073 97.7652 81.9588 97.5455C82.1141 97.3258 82.1918 97.0625 82.1918 96.7557C82.1918 96.3352 82.0421 95.9962 81.7429 95.7386C81.4474 95.4811 81.027 95.3523 80.4815 95.3523H78.6122V98.233ZM89.1733 105.165C88.6165 105.165 88.1203 105.068 87.6847 104.875C87.2491 104.678 86.9044 104.388 86.6506 104.006C86.4006 103.619 86.2756 103.138 86.2756 102.562C86.2756 102.078 86.3646 101.67 86.5426 101.341C86.7206 101.011 86.9631 100.746 87.2699 100.545C87.5767 100.345 87.9252 100.193 88.3153 100.091C88.7093 99.9886 89.1222 99.9167 89.554 99.875C90.0616 99.822 90.4706 99.7727 90.7812 99.7273C91.0919 99.678 91.3172 99.6061 91.4574 99.5114C91.5975 99.4167 91.6676 99.2765 91.6676 99.0909V99.0568C91.6676 98.697 91.554 98.4186 91.3267 98.2216C91.1032 98.0246 90.785 97.9261 90.3722 97.9261C89.9366 97.9261 89.59 98.0227 89.3324 98.2159C89.0748 98.4053 88.9044 98.6439 88.821 98.9318L86.5824 98.75C86.696 98.2197 86.9195 97.7614 87.2528 97.375C87.5862 96.9848 88.0161 96.6856 88.5426 96.4773C89.0729 96.2652 89.6866 96.1591 90.3835 96.1591C90.8684 96.1591 91.3324 96.2159 91.7756 96.3295C92.2225 96.4432 92.6184 96.6193 92.9631 96.858C93.3116 97.0966 93.5862 97.4034 93.7869 97.7784C93.9877 98.1496 94.0881 98.5947 94.0881 99.1136V105H91.7926V103.79H91.7244C91.5843 104.062 91.3968 104.303 91.1619 104.511C90.9271 104.716 90.6449 104.877 90.3153 104.994C89.9858 105.108 89.6051 105.165 89.1733 105.165ZM89.8665 103.494C90.2225 103.494 90.5369 103.424 90.8097 103.284C91.0824 103.14 91.2964 102.947 91.4517 102.705C91.607 102.462 91.6847 102.187 91.6847 101.881V100.955C91.6089 101.004 91.5047 101.049 91.3722 101.091C91.2434 101.129 91.0975 101.165 90.9347 101.199C90.7718 101.229 90.6089 101.258 90.446 101.284C90.2831 101.307 90.1354 101.328 90.0028 101.347C89.7188 101.388 89.4706 101.455 89.2585 101.545C89.0464 101.636 88.8816 101.759 88.7642 101.915C88.6468 102.066 88.5881 102.256 88.5881 102.483C88.5881 102.812 88.7074 103.064 88.946 103.239C89.1884 103.409 89.4953 103.494 89.8665 103.494ZM99.1818 105.142C98.5189 105.142 97.9186 104.972 97.3807 104.631C96.8466 104.286 96.4223 103.78 96.108 103.114C95.7973 102.443 95.642 101.621 95.642 100.648C95.642 99.6477 95.803 98.8163 96.125 98.1534C96.447 97.4867 96.875 96.9886 97.4091 96.6591C97.947 96.3258 98.536 96.1591 99.1761 96.1591C99.6648 96.1591 100.072 96.2424 100.398 96.4091C100.727 96.572 100.992 96.7765 101.193 97.0227C101.398 97.2652 101.553 97.5038 101.659 97.7386H101.733V93.3636H104.148V105H101.761V103.602H101.659C101.545 103.845 101.384 104.085 101.176 104.324C100.972 104.559 100.705 104.754 100.375 104.909C100.049 105.064 99.6515 105.142 99.1818 105.142ZM99.9489 103.216C100.339 103.216 100.669 103.11 100.938 102.898C101.21 102.682 101.419 102.381 101.562 101.994C101.71 101.608 101.784 101.155 101.784 100.636C101.784 100.117 101.712 99.6667 101.568 99.2841C101.424 98.9015 101.216 98.6061 100.943 98.3977C100.67 98.1894 100.339 98.0852 99.9489 98.0852C99.5511 98.0852 99.2159 98.1932 98.9432 98.4091C98.6705 98.625 98.464 98.9242 98.3239 99.3068C98.1837 99.6894 98.1136 100.133 98.1136 100.636C98.1136 101.144 98.1837 101.593 98.3239 101.983C98.4678 102.369 98.6742 102.672 98.9432 102.892C99.2159 103.108 99.5511 103.216 99.9489 103.216ZM110.07 108.455C109.286 108.455 108.613 108.347 108.053 108.131C107.496 107.919 107.053 107.629 106.723 107.261C106.393 106.894 106.179 106.481 106.081 106.023L108.32 105.722C108.388 105.896 108.496 106.059 108.643 106.21C108.791 106.362 108.986 106.483 109.229 106.574C109.475 106.669 109.774 106.716 110.126 106.716C110.653 106.716 111.087 106.587 111.428 106.33C111.772 106.076 111.945 105.65 111.945 105.051V103.455H111.842C111.736 103.697 111.577 103.926 111.365 104.142C111.153 104.358 110.88 104.534 110.547 104.67C110.214 104.807 109.816 104.875 109.354 104.875C108.698 104.875 108.102 104.723 107.564 104.42C107.03 104.114 106.604 103.646 106.286 103.017C105.971 102.384 105.814 101.585 105.814 100.619C105.814 99.6307 105.975 98.8049 106.297 98.142C106.619 97.4792 107.047 96.983 107.581 96.6534C108.119 96.3239 108.708 96.1591 109.348 96.1591C109.837 96.1591 110.246 96.2424 110.575 96.4091C110.905 96.572 111.17 96.7765 111.371 97.0227C111.575 97.2652 111.732 97.5038 111.842 97.7386H111.933V96.2727H114.337V105.085C114.337 105.828 114.155 106.449 113.791 106.949C113.428 107.449 112.924 107.824 112.28 108.074C111.64 108.328 110.903 108.455 110.07 108.455ZM110.121 103.057C110.511 103.057 110.84 102.96 111.109 102.767C111.382 102.57 111.59 102.29 111.734 101.926C111.882 101.559 111.956 101.119 111.956 100.608C111.956 100.097 111.884 99.6534 111.74 99.2784C111.596 98.8996 111.388 98.6061 111.115 98.3977C110.842 98.1894 110.511 98.0852 110.121 98.0852C109.723 98.0852 109.388 98.1932 109.115 98.4091C108.842 98.6212 108.636 98.9167 108.496 99.2955C108.356 99.6742 108.286 100.112 108.286 100.608C108.286 101.112 108.356 101.547 108.496 101.915C108.64 102.278 108.846 102.561 109.115 102.761C109.388 102.958 109.723 103.057 110.121 103.057ZM120.24 105.17C119.342 105.17 118.57 104.989 117.922 104.625C117.278 104.258 116.782 103.739 116.433 103.068C116.085 102.394 115.911 101.597 115.911 100.676C115.911 99.7784 116.085 98.9905 116.433 98.3125C116.782 97.6345 117.272 97.1061 117.905 96.7273C118.541 96.3485 119.287 96.1591 120.143 96.1591C120.719 96.1591 121.255 96.2519 121.751 96.4375C122.251 96.6193 122.687 96.8939 123.058 97.2614C123.433 97.6288 123.725 98.0909 123.933 98.6477C124.142 99.2008 124.246 99.8485 124.246 100.591V101.256H116.876V99.7557H121.967C121.967 99.4072 121.892 99.0985 121.74 98.8295C121.589 98.5606 121.378 98.3504 121.109 98.1989C120.844 98.0436 120.536 97.9659 120.183 97.9659C119.816 97.9659 119.49 98.0511 119.206 98.2216C118.926 98.3883 118.706 98.6136 118.547 98.8977C118.388 99.178 118.306 99.4905 118.303 99.8352V101.261C118.303 101.693 118.382 102.066 118.541 102.381C118.704 102.695 118.933 102.938 119.229 103.108C119.524 103.278 119.875 103.364 120.28 103.364C120.549 103.364 120.795 103.326 121.018 103.25C121.242 103.174 121.433 103.061 121.592 102.909C121.751 102.758 121.873 102.572 121.956 102.352L124.195 102.5C124.081 103.038 123.848 103.508 123.496 103.909C123.147 104.307 122.696 104.617 122.143 104.841C121.594 105.061 120.96 105.17 120.24 105.17Z" fill="#B3B3B3"/>
                    </svg>

                </div>

                {/* Congrats Contianer */}
                <div className="myCongratsContainer">
                    <h1>CONGRATULATIONS!</h1>
                </div>

                {/* Course that earned Badge in */}
                <div className="myEarnedBadgeContainer">
                    <p>You Earned the <span className="badge">{Badge}</span> Badge!</p>
                </div>

                {/* Button Container */}
                <div className="myClaimButtonContainer">
                    <button type="button" className="claimButton" onClick>Claim</button>
                </div>
            </div>

            
                    
             
            
        </div>
    );
}


export default myComp; 

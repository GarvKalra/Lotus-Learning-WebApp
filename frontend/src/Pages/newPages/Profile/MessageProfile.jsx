import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GeneralNavbar from "../../../components/navbar/GeneralNavbar";
import markNotificationAsRead from '../../../BackendProxy/notificationProxy/markNotificationAsRead';

const MessageProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const notificationData = location.state?.notificationData;

    const handleBackClick = () => {
        navigate('/user/notifications');
    };

    useEffect(() => {
        // Disable scrolling when this component is mounted
        document.body.style.overflow = 'hidden';

        return () => {
            // Re-enable scrolling when this component is unmounted
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <>
            <GeneralNavbar />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '2rem',
            }}>
                {notificationData ? (
                    <div style={{
                        border: '2px solid black',
                        padding: '2rem',
                        borderRadius: '8px',
                        width: '600px',       
                        height: '400px',      
                        wordWrap: 'break-word',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start'
                    }}>
                        <h2 style={{
                            fontSize: '2rem',
                            marginBottom: '1rem',
                            wordWrap: 'break-word',
                            textAlign: 'center',
                            width: '100%',
                        }}>
                            {notificationData.payload.title}
                        </h2>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            fontSize: '1.2rem',
                            marginBottom: '1rem'
                        }}>
                            <p style={{ margin: 0 }}><strong>From:</strong> {notificationData.senderName}</p>
                            <p style={{ margin: 0 }}><strong>Date:</strong> {notificationData.date}</p>
                        </div>

                        <div style={{
                            width: '100%',          
                            height: '150px',       
                            overflowY: 'auto',       
                            overflowX: 'hidden',     
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1.2rem',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            textAlign: 'left'
                        }}>
                            {notificationData.payload.message}
                        </div>
                    </div>
                ) : (
                    <p style={{
                        border: '2px solid black',
                        padding: '3rem',
                        borderRadius: '8px',
                        fontSize: '1.2rem',
                        wordWrap: 'break-word',
                        width: '600px',
                        height: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}>
                        No message data available
                    </p>
                )}
                
                <button 
                    onClick={handleBackClick}
                    className="text-white font-medium px-3 py-3 ml-3 mt-8 rounded-full linearGradient_ver1 text-sm hover:scale-[1.05] transition-all"
                    style={{
                        marginTop: '1rem',
                        textAlign: 'center'
                    }}
                >
                    Back to Notifications
                </button>
            </div>
        </>
    );
};

export default MessageProfile;

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHouse,
    faFileCirclePlus,
    faCircleInfo,
    faEnvelope,
    faBolt,
    faBars,
    faXmark,
    faMoon,
    faSun,
    faRightToBracket,
    faRightFromBracket,
    faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isDarkMode, toggleTheme } = useTheme();
    const { isAuthenticated, user, logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: faHouse, private: true },
        { name: 'New Quotation', path: '/add', icon: faFileCirclePlus, private: true },
        { name: 'About', path: '/about', icon: faCircleInfo, private: false },
        { name: 'Contact', path: '/contact', icon: faEnvelope, private: false },
    ];

    const filteredNavItems = navItems.filter(item => !item.private || isAuthenticated);

    const isActive = (path: string) => location.pathname === path;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close sidebar when route changes
    useEffect(() => {
        closeSidebar();
    }, [location.pathname]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSidebarOpen]);

    return (
        <>
            <nav className={`sticky top-0 z-50 backdrop-blur-lg transition-all duration-500 ${scrolled
                ? 'bg-white/90 dark:bg-gray-900/90 shadow-lg'
                : 'bg-white/70 dark:bg-gray-900/70 shadow-sm'
                } border-b border-gray-200 dark:border-gray-700`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className={`w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${scrolled ? 'group-hover:shadow-2xl group-hover:scale-110' : 'group-hover:shadow-xl group-hover:scale-105'
                                }`}>
                                <FontAwesomeIcon icon={faBolt} className="text-white text-2xl transition-transform duration-300 group-hover:rotate-12" />
                            </div>
                            <span className="text-2xl font-black bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent transition-all duration-300 group-hover:from-red-700 group-hover:to-red-800">
                                Harsh Electricals
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-2">
                            {filteredNavItems.map((item, index) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative px-4 py-2 rounded-xl font-bold tracking-tight transition-all duration-300 flex items-center space-x-2 overflow-hidden group ${isActive(item.path)
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400'
                                        }`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <FontAwesomeIcon
                                        icon={item.icon}
                                        className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                                    />
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            ))}

                            <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2" />

                            {isAuthenticated ? (
                                <div className="flex items-center space-x-3">
                                    <div className="hidden lg:flex flex-col items-end mr-2">
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user?.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">{user?.role}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center space-x-2 group"
                                    >
                                        <FontAwesomeIcon icon={faRightFromBracket} className="transition-transform group-hover:translate-x-1" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link
                                        to="/login"
                                        className="px-5 py-2 text-gray-700 dark:text-gray-300 font-bold hover:text-red-600 transition-all flex items-center space-x-2"
                                    >
                                        <FontAwesomeIcon icon={faRightToBracket} />
                                        <span>Login</span>
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:scale-105 transition-all flex items-center space-x-2"
                                    >
                                        <FontAwesomeIcon icon={faUserPlus} />
                                        <span>Sign Up</span>
                                    </Link>
                                </div>
                            )}

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="ml-2 p-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 hover:rotate-12 group relative"
                                aria-label="Toggle theme"
                            >
                                <FontAwesomeIcon
                                    icon={isDarkMode ? faSun : faMoon}
                                    className="text-xl relative z-10 transition-all duration-300"
                                />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center space-x-2">
                            <button
                                onClick={toggleTheme}
                                className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            >
                                <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="text-gray-700 dark:text-gray-300" />
                            </button>
                            <button
                                onClick={toggleSidebar}
                                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            >
                                <FontAwesomeIcon icon={isSidebarOpen ? faXmark : faBars} className="text-gray-700 dark:text-gray-300 text-xl" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-[60] md:hidden transition-all duration-500 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
                <div
                    className={`absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={closeSidebar}
                />
                <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-8 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30">
                                    <FontAwesomeIcon icon={faBolt} className="text-white text-xl" />
                                </div>
                                <span className="text-xl font-black text-gray-900 dark:text-white">Harsh Electricals</span>
                            </div>
                            <button onClick={closeSidebar} className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                                <FontAwesomeIcon icon={faXmark} className="text-2xl" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-2">
                            {filteredNavItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeSidebar}
                                    className={`flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${isActive(item.path)
                                        ? 'bg-red-600 text-white shadow-xl shadow-red-600/20'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={item.icon} className="text-lg" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-auto pt-8 border-t border-gray-100 dark:border-gray-800">
                            {isAuthenticated ? (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4 px-4">
                                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 font-bold text-xl">
                                            {user?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{user?.name}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest">{user?.role}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-red-600 font-bold rounded-2xl flex items-center justify-center space-x-2"
                                    >
                                        <FontAwesomeIcon icon={faRightFromBracket} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link
                                        to="/login"
                                        onClick={closeSidebar}
                                        className="py-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl text-center"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={closeSidebar}
                                        className="py-4 bg-red-600 text-white font-bold rounded-2xl text-center shadow-lg shadow-red-600/20"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;

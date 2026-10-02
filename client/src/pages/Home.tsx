import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300 page-transition">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    {/* Logo/Icon */}
                    <div className="flex justify-center mb-10 animate-fadeIn">
                        <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-xl shadow-red-600/30 animate-float">
                            <svg
                                className="w-14 h-14 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>

                    {/* Business Name */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent animate-fadeIn animation-delay-200">
                        Harsh Electricals Works
                    </h1>

                    {/* Tagline */}
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto animate-fadeIn animation-delay-400 leading-relaxed">
                        Professional Electrical Solutions & Premium Quotation Management
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn animation-delay-600 mb-16">
                        <Link
                            to="/add"
                            className="group px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                        >
                            <svg
                                className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Create Quotation</span>
                        </Link>

                        <Link
                            to="/dashboard"
                            className="px-8 py-4 bg-white dark:bg-gray-800 text-red-600 rounded-xl font-bold border-2 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-2"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>View Dashboard</span>
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: (
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            ),
                            title: 'Easy Quotations',
                            description: 'Create professional quotations in minutes with our intuitive interface',
                            color: 'from-blue-100 to-blue-200',
                            iconColor: 'text-blue-600',
                        },
                        {
                            icon: (
                                <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            ),
                            title: 'PDF Export',
                            description: 'Download professional PDF quotations with your letterhead instantly',
                            color: 'from-green-100 to-green-200',
                            iconColor: 'text-green-600',
                        },
                        {
                            icon: (
                                <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            ),
                            title: 'Data Management',
                            description: 'Store and manage all your quotations in one secure place',
                            color: 'from-purple-100 to-purple-200',
                            iconColor: 'text-purple-600',
                        },
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 animate-fadeIn"
                            style={{ animationDelay: `${(index + 8) * 80}ms` }}
                        >
                            <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center mb-6 shadow-md`}>
                                <svg
                                    className={`w-8 h-8 ${feature.iconColor}`}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    {feature.icon}
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;

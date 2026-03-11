const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-900 dark:to-gray-800 py-12 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                        About Harsh Electricals Works
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-700 mx-auto rounded-full"></div>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    {/* Company Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg mr-4">
                                <svg
                                    className="w-10 h-10 text-white"
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
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Our Story</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            Harsh Electricals Works is a leading provider of professional electrical solutions,
                            committed to delivering excellence in every project. With years of experience in the
                            industry, we have built a reputation for quality workmanship, reliability, and
                            customer satisfaction.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Our team of skilled electricians and technicians are dedicated to providing
                            comprehensive electrical services for residential, commercial, and industrial clients.
                        </p>
                    </div>

                    {/* Services Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Our Services</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                'Electrical Installation',
                                'Maintenance & Repairs',
                                'Wiring & Rewiring',
                                'Panel Upgrades',
                                'Emergency Services',
                                'Consultation & Planning',
                                'Industrial Solutions',
                                'Energy Efficiency Audits',
                            ].map((service, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <svg
                                        className="w-5 h-5 text-red-600 flex-shrink-0"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700 dark:text-gray-300">{service}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Values Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Our Values</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    title: 'Quality',
                                    description: 'We never compromise on the quality of our work and materials.',
                                },
                                {
                                    title: 'Safety',
                                    description: 'Safety is our top priority in every project we undertake.',
                                },
                                {
                                    title: 'Reliability',
                                    description: 'We deliver on our promises and meet deadlines consistently.',
                                },
                                {
                                    title: 'Customer Satisfaction',
                                    description: 'Your satisfaction is our success, and we strive to exceed expectations.',
                                },
                            ].map((value, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                        <svg
                                            className="w-6 h-6 text-red-600"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{value.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* App Info Card */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">About This Application</h2>
                        <p className="leading-relaxed opacity-90">
                            This quotation management system is designed to streamline our business operations,
                            making it easy to create, manage, and track professional quotations. Built with modern
                            web technologies, it ensures a smooth and efficient workflow for our team and provides
                            a professional experience for our clients.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;

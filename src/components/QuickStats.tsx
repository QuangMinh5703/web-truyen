const QuickStats = () => {
  const stats = [
    {
      icon: '📚',
      label: 'Tổng truyện',
      value: '1,234',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '👁️',
      label: 'Lượt xem',
      value: '125M',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '🔥',
      label: 'Cập nhật hôm nay',
      value: '245',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: '⭐',
      label: 'Đánh giá trung bình',
      value: '4.7',
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
        >
          <div className="text-4xl mb-3">{stat.icon}</div>
          <div className="text-3xl font-bold mb-1">{stat.value}</div>
          <div className="text-sm opacity-90">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;

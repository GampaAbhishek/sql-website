'use client';

import { useState, useEffect } from 'react';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import { 
  Play, 
  Database, 
  Brain, 
  Lightbulb, 
  RefreshCw, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  Zap,
  Target,
  Clock,
  Star,
  ChevronDown,
  ChevronRight,
  Code,
  Send,
  RotateCcw,
  Award,
  Flame,
  Shuffle,
  BarChart3
} from 'lucide-react';

interface UserProgress {
  currentStreak: number;
  totalPoints: number;
  problemsSolved: number;
  hintsUsed: number;
  accuracy: number;
  sessionTime: number;
}

interface DatabaseSchema {
  id: string;
  name: string;
  description: string;
  tables: {
    name: string;
    columns: {
      name: string;
      type: string;
      isPrimary?: boolean;
      isForeign?: boolean;
      references?: string;
    }[];
    sampleData: Record<string, any>[];
  }[];
  theme: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface AIQuestion {
  id: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  description: string;
  expectedQuery: string;
  hints: string[];
  tags: string[];
  estimatedTime: string;
}

interface HintLevel {
  id: string;
  level: number;
  title: string;
  content: string;
  pointPenalty: number;
  isRevealed: boolean;
}

// AI-Generated Database Schemas
const AI_DATABASES: DatabaseSchema[] = [
  {
    id: 'library-mgmt',
    name: 'Library Management System',
    description: 'Comprehensive library database with books, members, and transactions',
    theme: 'Educational',
    difficulty: 'Beginner',
    tables: [
      {
        name: 'books',
        columns: [
          { name: 'book_id', type: 'INT PRIMARY KEY', isPrimary: true },
          { name: 'title', type: 'VARCHAR(255)' },
          { name: 'author', type: 'VARCHAR(100)' },
          { name: 'genre', type: 'VARCHAR(50)' },
          { name: 'isbn', type: 'VARCHAR(20)' },
          { name: 'publication_year', type: 'INT' },
          { name: 'available_copies', type: 'INT' },
          { name: 'total_copies', type: 'INT' }
        ],
        sampleData: [
          { book_id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Fiction', isbn: '978-0-7432-7356-5', publication_year: 1925, available_copies: 3, total_copies: 5 },
          { book_id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', isbn: '978-0-06-112008-4', publication_year: 1960, available_copies: 2, total_copies: 4 },
          { book_id: 3, title: '1984', author: 'George Orwell', genre: 'Science Fiction', isbn: '978-0-452-28423-4', publication_year: 1949, available_copies: 1, total_copies: 3 }
        ]
      },
      {
        name: 'members',
        columns: [
          { name: 'member_id', type: 'INT PRIMARY KEY', isPrimary: true },
          { name: 'first_name', type: 'VARCHAR(50)' },
          { name: 'last_name', type: 'VARCHAR(50)' },
          { name: 'email', type: 'VARCHAR(100)' },
          { name: 'phone', type: 'VARCHAR(15)' },
          { name: 'membership_date', type: 'DATE' },
          { name: 'membership_type', type: 'VARCHAR(20)' },
          { name: 'is_active', type: 'BOOLEAN' }
        ],
        sampleData: [
          { member_id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@email.com', phone: '555-0101', membership_date: '2024-01-15', membership_type: 'Regular', is_active: true },
          { member_id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@email.com', phone: '555-0102', membership_date: '2024-02-20', membership_type: 'Premium', is_active: true },
          { member_id: 3, first_name: 'Bob', last_name: 'Johnson', email: 'bob.johnson@email.com', phone: '555-0103', membership_date: '2023-12-10', membership_type: 'Student', is_active: false }
        ]
      },
      {
        name: 'borrowings',
        columns: [
          { name: 'borrowing_id', type: 'INT PRIMARY KEY', isPrimary: true },
          { name: 'member_id', type: 'INT', isForeign: true, references: 'members(member_id)' },
          { name: 'book_id', type: 'INT', isForeign: true, references: 'books(book_id)' },
          { name: 'borrow_date', type: 'DATE' },
          { name: 'due_date', type: 'DATE' },
          { name: 'return_date', type: 'DATE' },
          { name: 'fine_amount', type: 'DECIMAL(10,2)' }
        ],
        sampleData: [
          { borrowing_id: 1, member_id: 1, book_id: 1, borrow_date: '2024-03-01', due_date: '2024-03-15', return_date: '2024-03-12', fine_amount: 0.00 },
          { borrowing_id: 2, member_id: 2, book_id: 2, borrow_date: '2024-03-05', due_date: '2024-03-19', return_date: null, fine_amount: 2.50 },
          { borrowing_id: 3, member_id: 1, book_id: 3, borrow_date: '2024-03-10', due_date: '2024-03-24', return_date: '2024-03-20', fine_amount: 0.00 }
        ]
      }
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Platform',
    description: 'Modern e-commerce system with customers, products, and orders',
    theme: 'Business',
    difficulty: 'Intermediate',
    tables: [
      {
        name: 'customers',
        columns: [
          { name: 'customer_id', type: 'INT PRIMARY KEY', isPrimary: true },
          { name: 'first_name', type: 'VARCHAR(50)' },
          { name: 'last_name', type: 'VARCHAR(50)' },
          { name: 'email', type: 'VARCHAR(100)' },
          { name: 'city', type: 'VARCHAR(50)' },
          { name: 'country', type: 'VARCHAR(50)' },
          { name: 'registration_date', type: 'TIMESTAMP' },
          { name: 'total_spent', type: 'DECIMAL(12,2)' }
        ],
        sampleData: [
          { customer_id: 1, first_name: 'Alice', last_name: 'Wilson', email: 'alice.wilson@email.com', city: 'New York', country: 'USA', registration_date: '2024-01-15 10:30:00', total_spent: 1250.75 },
          { customer_id: 2, first_name: 'Carlos', last_name: 'Rodriguez', email: 'carlos.rodriguez@email.com', city: 'Madrid', country: 'Spain', registration_date: '2024-02-03 14:20:00', total_spent: 890.50 },
          { customer_id: 3, first_name: 'Emma', last_name: 'Thompson', email: 'emma.thompson@email.com', city: 'London', country: 'UK', registration_date: '2024-01-28 09:15:00', total_spent: 2100.25 }
        ]
      },
      {
        name: 'products',
        columns: [
          { name: 'product_id', type: 'INT PRIMARY KEY', isPrimary: true },
          { name: 'product_name', type: 'VARCHAR(200)' },
          { name: 'category', type: 'VARCHAR(50)' },
          { name: 'price', type: 'DECIMAL(10,2)' },
          { name: 'stock_quantity', type: 'INT' },
          { name: 'supplier_id', type: 'INT' },
          { name: 'rating', type: 'DECIMAL(3,2)' },
          { name: 'created_date', type: 'DATE' }
        ],
        sampleData: [
          { product_id: 1, product_name: 'Wireless Bluetooth Headphones', category: 'Electronics', price: 79.99, stock_quantity: 150, supplier_id: 101, rating: 4.5, created_date: '2024-01-10' },
          { product_id: 2, product_name: 'Organic Cotton T-Shirt', category: 'Clothing', price: 25.99, stock_quantity: 300, supplier_id: 102, rating: 4.2, created_date: '2024-01-15' },
          { product_id: 3, product_name: 'Stainless Steel Water Bottle', category: 'Sports', price: 19.99, stock_quantity: 200, supplier_id: 103, rating: 4.8, created_date: '2024-01-20' }
        ]
      },
      {
        name: 'orders',
        columns: [
          { name: 'order_id', type: 'INT PRIMARY KEY', isPrimary: true },
          { name: 'customer_id', type: 'INT', isForeign: true, references: 'customers(customer_id)' },
          { name: 'order_date', type: 'TIMESTAMP' },
          { name: 'status', type: 'VARCHAR(20)' },
          { name: 'total_amount', type: 'DECIMAL(12,2)' },
          { name: 'shipping_address', type: 'TEXT' },
          { name: 'payment_method', type: 'VARCHAR(30)' }
        ],
        sampleData: [
          { order_id: 1, customer_id: 1, order_date: '2024-03-01 15:30:00', status: 'Delivered', total_amount: 105.98, shipping_address: '123 Main St, New York, NY 10001', payment_method: 'Credit Card' },
          { order_id: 2, customer_id: 2, order_date: '2024-03-05 11:45:00', status: 'Shipped', total_amount: 45.98, shipping_address: '456 Gran Via, Madrid, Spain', payment_method: 'PayPal' },
          { order_id: 3, customer_id: 3, order_date: '2024-03-08 09:20:00', status: 'Processing', total_amount: 159.96, shipping_address: '789 Oxford St, London, UK', payment_method: 'Debit Card' }
        ]
      }
    ]
  },
  {
    id: 'hospital',
    name: 'Hospital Management System',
    description: 'Advanced healthcare database with patients, doctors, and treatments',
    theme: 'Healthcare',
    difficulty: 'Advanced',
    tables: [
      {
        name: 'patients',
        columns: [
          { name: 'patient_id', type: 'INT PRIMARY KEY', isPrimary: true },
          { name: 'first_name', type: 'VARCHAR(50)' },
          { name: 'last_name', type: 'VARCHAR(50)' },
          { name: 'date_of_birth', type: 'DATE' },
          { name: 'gender', type: 'CHAR(1)' },
          { name: 'phone', type: 'VARCHAR(15)' },
          { name: 'email', type: 'VARCHAR(100)' },
          { name: 'emergency_contact', type: 'VARCHAR(100)' },
          { name: 'insurance_id', type: 'VARCHAR(50)' }
        ],
        sampleData: [
          { patient_id: 1, first_name: 'Michael', last_name: 'Johnson', date_of_birth: '1985-06-15', gender: 'M', phone: '555-1001', email: 'michael.j@email.com', emergency_contact: 'Sarah Johnson (555-1002)', insurance_id: 'INS001' },
          { patient_id: 2, first_name: 'Sarah', last_name: 'Davis', date_of_birth: '1992-11-22', gender: 'F', phone: '555-1003', email: 'sarah.davis@email.com', emergency_contact: 'Tom Davis (555-1004)', insurance_id: 'INS002' },
          { patient_id: 3, first_name: 'Robert', last_name: 'Brown', date_of_birth: '1978-03-08', gender: 'M', phone: '555-1005', email: 'robert.brown@email.com', emergency_contact: 'Lisa Brown (555-1006)', insurance_id: 'INS003' }
        ]
      },
      {
        name: 'doctors',
        columns: [
          { name: 'doctor_id', type: 'INT PRIMARY KEY', isPrimary: true },
          { name: 'first_name', type: 'VARCHAR(50)' },
          { name: 'last_name', type: 'VARCHAR(50)' },
          { name: 'specialization', type: 'VARCHAR(100)' },
          { name: 'phone', type: 'VARCHAR(15)' },
          { name: 'email', type: 'VARCHAR(100)' },
          { name: 'years_experience', type: 'INT' },
          { name: 'department', type: 'VARCHAR(50)' }
        ],
        sampleData: [
          { doctor_id: 1, first_name: 'Dr. Emily', last_name: 'Carter', specialization: 'Cardiology', phone: '555-2001', email: 'emily.carter@hospital.com', years_experience: 12, department: 'Cardiology' },
          { doctor_id: 2, first_name: 'Dr. James', last_name: 'Wilson', specialization: 'Neurology', phone: '555-2002', email: 'james.wilson@hospital.com', years_experience: 8, department: 'Neurology' },
          { doctor_id: 3, first_name: 'Dr. Maria', last_name: 'Rodriguez', specialization: 'Pediatrics', phone: '555-2003', email: 'maria.rodriguez@hospital.com', years_experience: 15, department: 'Pediatrics' }
        ]
      },
      {
        name: 'appointments',
        columns: [
          { name: 'appointment_id', type: 'INT PRIMARY KEY', isPrimary: true },
          { name: 'patient_id', type: 'INT', isForeign: true, references: 'patients(patient_id)' },
          { name: 'doctor_id', type: 'INT', isForeign: true, references: 'doctors(doctor_id)' },
          { name: 'appointment_date', type: 'DATETIME' },
          { name: 'duration_minutes', type: 'INT' },
          { name: 'status', type: 'VARCHAR(20)' },
          { name: 'notes', type: 'TEXT' },
          { name: 'cost', type: 'DECIMAL(10,2)' }
        ],
        sampleData: [
          { appointment_id: 1, patient_id: 1, doctor_id: 1, appointment_date: '2024-03-15 10:00:00', duration_minutes: 30, status: 'Completed', notes: 'Regular check-up, all normal', cost: 150.00 },
          { appointment_id: 2, patient_id: 2, doctor_id: 2, appointment_date: '2024-03-16 14:30:00', duration_minutes: 45, status: 'Scheduled', notes: 'Follow-up neurological examination', cost: 200.00 },
          { appointment_id: 3, patient_id: 3, doctor_id: 3, appointment_date: '2024-03-17 09:15:00', duration_minutes: 60, status: 'Completed', notes: 'Pediatric consultation for child development', cost: 180.00 }
        ]
      }
    ]
  }
];

export default function AIPlayground() {
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseSchema>(AI_DATABASES[0]);
  const [currentQuestion, setCurrentQuestion] = useState<AIQuestion | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [showSchema, setShowSchema] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [hints, setHints] = useState<HintLevel[]>([]);
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());
  const [userProgress, setUserProgress] = useState<UserProgress>({
    currentStreak: 7,
    totalPoints: 2350,
    problemsSolved: 23,
    hintsUsed: 8,
    accuracy: 87,
    sessionTime: 145
  });

  // AI Question Generation
  const generateAIQuestion = () => {
    const difficulties: ('Beginner' | 'Intermediate' | 'Advanced')[] = ['Beginner', 'Intermediate', 'Advanced'];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    // AI Logic: Generate contextual questions based on selected database
    const questionTemplates = {
      'library-mgmt': [
        {
          difficulty: 'Beginner' as const,
          title: 'Find All Available Books',
          description: 'As a librarian, you need to find all books that are currently available for borrowing.',
          expectedQuery: 'SELECT title, author, available_copies FROM books WHERE available_copies > 0;',
          hints: [
            'Think about which table contains book information',
            'You need to filter books that have copies available',
            'Use the WHERE clause to check available_copies',
            'available_copies should be greater than 0'
          ],
          tags: ['SELECT', 'WHERE', 'filtering'],
          estimatedTime: '3-5 minutes'
        },
        {
          difficulty: 'Intermediate' as const,
          title: 'Member Borrowing History',
          description: 'Find all members who have borrowed books, along with their borrowing details.',
          expectedQuery: 'SELECT m.first_name, m.last_name, b.title, br.borrow_date FROM members m JOIN borrowings br ON m.member_id = br.member_id JOIN books b ON br.book_id = b.book_id;',
          hints: [
            'This requires joining multiple tables',
            'Connect members to borrowings using member_id',
            'Connect borrowings to books using book_id',
            'Use JOIN statements to combine the data'
          ],
          tags: ['JOIN', 'multiple tables'],
          estimatedTime: '8-12 minutes'
        }
      ],
      'ecommerce': [
        {
          difficulty: 'Beginner' as const,
          title: 'Top Rated Products',
          description: 'Find all products with a rating of 4.5 or higher.',
          expectedQuery: 'SELECT product_name, category, price, rating FROM products WHERE rating >= 4.5;',
          hints: [
            'Look at the products table',
            'Filter by the rating column',
            'Use >= operator for "4.5 or higher"',
            'Include relevant product information'
          ],
          tags: ['SELECT', 'WHERE', 'comparison'],
          estimatedTime: '3-5 minutes'
        },
        {
          difficulty: 'Advanced' as const,
          title: 'Customer Order Analytics',
          description: 'Calculate the total spending per customer and their average order value.',
          expectedQuery: 'SELECT c.first_name, c.last_name, COUNT(o.order_id) as total_orders, SUM(o.total_amount) as total_spent, AVG(o.total_amount) as avg_order_value FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.first_name, c.last_name;',
          hints: [
            'This requires aggregation functions',
            'Join customers and orders tables',
            'Use GROUP BY to group by customer',
            'Use COUNT, SUM, and AVG functions'
          ],
          tags: ['JOIN', 'GROUP BY', 'aggregation'],
          estimatedTime: '12-15 minutes'
        }
      ],
      'hospital': [
        {
          difficulty: 'Intermediate' as const,
          title: 'Doctor Appointment Schedule',
          description: 'Show all appointments for each doctor with patient information.',
          expectedQuery: 'SELECT d.first_name as doctor_name, d.specialization, p.first_name as patient_name, a.appointment_date, a.status FROM doctors d JOIN appointments a ON d.doctor_id = a.doctor_id JOIN patients p ON a.patient_id = p.patient_id ORDER BY a.appointment_date;',
          hints: [
            'Join three tables: doctors, appointments, and patients',
            'Use aliases to distinguish between doctor and patient names',
            'Order the results by appointment date',
            'Include relevant information from each table'
          ],
          tags: ['JOIN', 'ORDER BY', 'aliases'],
          estimatedTime: '10-12 minutes'
        }
      ]
    };

    const dbQuestions = questionTemplates[selectedDatabase.id as keyof typeof questionTemplates] || [];
    if (dbQuestions.length === 0) return;

    const randomQuestion = dbQuestions[Math.floor(Math.random() * dbQuestions.length)];
    
    const aiQuestion: AIQuestion = {
      id: `ai-${Date.now()}`,
      ...randomQuestion
    };

    setCurrentQuestion(aiQuestion);
    setUserQuery('');
    setQueryResult(null);
    setRevealedHints(new Set());
    
    // Generate progressive hints
    const progressiveHints: HintLevel[] = aiQuestion.hints.map((hint, index) => ({
      id: `hint-${index + 1}`,
      level: index + 1,
      title: `Hint ${index + 1}`,
      content: hint,
      pointPenalty: 5 + (index * 3),
      isRevealed: false
    }));
    
    setHints(progressiveHints);
  };

  // Execute Query (Simulated)
  const executeQuery = () => {
    if (!userQuery.trim()) return;

    // Simulate query execution
    setTimeout(() => {
      const mockResult = {
        success: true,
        rows: [
          ['Column 1', 'Column 2', 'Column 3'],
          ['Data 1', 'Data 2', 'Data 3'],
          ['Data 4', 'Data 5', 'Data 6']
        ],
        executionTime: Math.random() * 100 + 50,
        message: 'Query executed successfully'
      };
      setQueryResult(mockResult);
    }, 1000);
  };

  // Reveal Hint
  const revealHint = (hintId: string) => {
    const hint = hints.find(h => h.id === hintId);
    if (!hint || revealedHints.has(hintId)) return;

    setRevealedHints(new Set([...revealedHints, hintId]));
    
    // Deduct points for using hint
    setUserProgress(prev => ({
      ...prev,
      totalPoints: prev.totalPoints - hint.pointPenalty,
      hintsUsed: prev.hintsUsed + 1
    }));
  };

  // Initialize with first question
  useEffect(() => {
    generateAIQuestion();
  }, [selectedDatabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ResponsiveNavbar />
      
      <div className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
              <Brain className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-purple-300 font-medium">AI-Enhanced Playground</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Practice SQL with <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI Intelligence</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Experience the future of SQL learning with AI-generated databases, intelligent question creation, and progressive hints that teach you to think like a pro.
            </p>
          </div>

          {/* User Progress Bar */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Streak</p>
                <p className="text-white font-bold text-xl">{userProgress.currentStreak}</p>
              </div>
              <div className="text-center">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Points</p>
                <p className="text-white font-bold text-xl">{userProgress.totalPoints.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Solved</p>
                <p className="text-white font-bold text-xl">{userProgress.problemsSolved}</p>
              </div>
              <div className="text-center">
                <Lightbulb className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Hints Used</p>
                <p className="text-white font-bold text-xl">{userProgress.hintsUsed}</p>
              </div>
              <div className="text-center">
                <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Accuracy</p>
                <p className="text-white font-bold text-xl">{userProgress.accuracy}%</p>
              </div>
              <div className="text-center">
                <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Session</p>
                <p className="text-white font-bold text-xl">{userProgress.sessionTime}m</p>
              </div>
            </div>
          </div>

          {/* Database Selection */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Database className="w-6 h-6 mr-2 text-blue-400" />
              AI-Generated Databases
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AI_DATABASES.map((db) => (
                <button
                  key={db.id}
                  onClick={() => setSelectedDatabase(db)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedDatabase.id === db.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="text-left">
                    <h4 className="text-white font-medium mb-2">{db.name}</h4>
                    <p className="text-slate-400 text-sm mb-3">{db.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs ${
                        db.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                        db.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {db.difficulty}
                      </span>
                      <span className="text-slate-500 text-sm">{db.tables.length} tables</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Schema & Question */}
            <div className="space-y-6">
              {/* Database Schema */}
              <div className="bg-slate-800 rounded-lg border border-slate-700">
                <div className="p-4 border-b border-slate-700">
                  <button
                    onClick={() => setShowSchema(!showSchema)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Database className="w-5 h-5 mr-2 text-blue-400" />
                      Schema: {selectedDatabase.name}
                    </h3>
                    {showSchema ? 
                      <ChevronDown className="w-5 h-5 text-slate-400" /> : 
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    }
                  </button>
                </div>
                
                {showSchema && (
                  <div className="p-4 max-h-96 overflow-y-auto">
                    {selectedDatabase.tables.map((table) => (
                      <div key={table.name} className="mb-4 last:mb-0">
                        <h4 className="text-yellow-400 font-mono text-sm mb-2">{table.name}</h4>
                        <div className="space-y-1">
                          {table.columns.map((column) => (
                            <div key={column.name} className="flex items-center text-sm">
                              <span className={`font-mono ${column.isPrimary ? 'text-green-400' : column.isForeign ? 'text-blue-400' : 'text-slate-300'}`}>
                                {column.name}
                              </span>
                              <span className="text-slate-500 ml-2">{column.type}</span>
                              {column.isPrimary && <span className="text-green-400 ml-2 text-xs">PK</span>}
                              {column.isForeign && <span className="text-blue-400 ml-2 text-xs">FK</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Question */}
              {currentQuestion && (
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">AI Generated Challenge</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        currentQuestion.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                        currentQuestion.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {currentQuestion.difficulty}
                      </span>
                      <button
                        onClick={generateAIQuestion}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="text-white font-medium mb-3">{currentQuestion.title}</h4>
                  <p className="text-slate-300 mb-4">{currentQuestion.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{currentQuestion.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {currentQuestion.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Hint System */}
              <div className="bg-slate-800 rounded-lg border border-slate-700">
                <div className="p-4 border-b border-slate-700">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                      AI Hints ({revealedHints.size}/{hints.length})
                    </h3>
                    {showHints ? 
                      <ChevronDown className="w-5 h-5 text-slate-400" /> : 
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    }
                  </button>
                </div>
                
                {showHints && (
                  <div className="p-4">
                    {hints.map((hint) => {
                      const isRevealed = revealedHints.has(hint.id);
                      const canReveal = hint.level === 1 || revealedHints.has(`hint-${hint.level - 1}`);
                      
                      return (
                        <div key={hint.id} className="mb-3 last:mb-0">
                          <div className="flex items-center justify-between p-3 bg-slate-700 rounded border border-slate-600">
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isRevealed ? 'bg-green-500 text-white' : 
                                canReveal ? 'bg-yellow-500 text-black' : 'bg-slate-600 text-slate-400'
                              }`}>
                                {hint.level}
                              </div>
                              <span className="text-white font-medium">{hint.title}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-400 text-sm">-{hint.pointPenalty} pts</span>
                              {isRevealed ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : canReveal ? (
                                <button
                                  onClick={() => revealHint(hint.id)}
                                  className="flex items-center px-2 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Reveal
                                </button>
                              ) : (
                                <EyeOff className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                          </div>
                          
                          {isRevealed && (
                            <div className="mt-2 p-3 bg-slate-600 rounded text-slate-200 text-sm">
                              {hint.content}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Center Column - SQL Editor */}
            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Code className="w-5 h-5 mr-2 text-green-400" />
                  SQL Editor
                </h3>
              </div>
              
              <div className="p-4">
                <textarea
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="-- Write your SQL query here
-- Example: SELECT * FROM books WHERE available_copies > 0;

"
                  className="w-full h-64 bg-slate-900 border border-slate-600 rounded-lg p-4 text-green-400 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                />
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={executeQuery}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute Query
                    </button>
                    <button
                      onClick={() => setUserQuery('')}
                      className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear
                    </button>
                  </div>
                  
                  <button
                    onClick={generateAIQuestion}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    New Question
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                  Query Results
                </h3>
              </div>
              
              <div className="p-4">
                {queryResult ? (
                  <div>
                    <div className="flex items-center space-x-4 mb-4 p-3 bg-green-500/10 rounded border border-green-500/20">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-green-400 font-medium">Query Executed Successfully</p>
                        <p className="text-slate-400 text-sm">
                          {queryResult.rows.length - 1} rows returned in {queryResult.executionTime.toFixed(0)}ms
                        </p>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-600">
                            {queryResult.rows[0]?.map((header: string, index: number) => (
                              <th key={index} className="text-left p-2 text-slate-300 font-medium">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {queryResult.rows.slice(1).map((row: string[], index: number) => (
                            <tr key={index} className="border-b border-slate-700">
                              {row.map((cell: string, cellIndex: number) => (
                                <td key={cellIndex} className="p-2 text-slate-300">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">Execute a query to see results here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Features Showcase */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 p-6">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Generated Questions</h3>
              <p className="text-slate-300">
                Intelligent question generation based on database schemas and your skill level. Never run out of challenges!
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20 p-6">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Progressive Hints</h3>
              <p className="text-slate-300">
                Smart hint system that guides your thinking without giving away answers. Learn to solve problems independently.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20 p-6">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Gamified Learning</h3>
              <p className="text-slate-300">
                Earn points, maintain streaks, and track your progress. Make learning SQL addictive and rewarding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

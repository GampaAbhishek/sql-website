'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Lock, 
  CheckCircle, 
  Circle, 
  Play, 
  Star, 
  Trophy, 
  Lightbulb, 
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Code,
  BookOpen,
  Target,
  Award,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
  User,
  Menu,
  X
} from 'lucide-react';

interface LessonProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  sampleInput: string;
  expectedOutput: string;
  hint?: string;
  solution: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  syntaxExamples: {
    title: string;
    code: string;
    explanation: string;
  }[];
  tips: string[];
  commonMistakes: string[];
  problems: LessonProblem[];
  isUnlocked: boolean;
  isCompleted: boolean;
  completionPercentage: number;
  prerequisiteIds: string[];
}

const LEARNING_PATH_DATA: Lesson[] = [
  {
    id: 'select-basics',
    title: 'SELECT Basics',
    description: 'Master the fundamentals of retrieving data from SQL databases using SELECT statements.',
    difficulty: 'Beginner',
    estimatedTime: '45 min',
    syntaxExamples: [
      {
        title: 'Basic SELECT',
        code: 'SELECT column1, column2 FROM table_name;',
        explanation: 'Retrieves specific columns from a table'
      },
      {
        title: 'SELECT All Columns',
        code: 'SELECT * FROM table_name;',
        explanation: 'Retrieves all columns from a table'
      },
      {
        title: 'SELECT with LIMIT',
        code: 'SELECT * FROM table_name LIMIT 10;',
        explanation: 'Limits the number of rows returned'
      }
    ],
    tips: [
      'Always specify column names instead of using * in production queries',
      'Use LIMIT to avoid accidentally retrieving too much data',
      'Column names are case-insensitive in most SQL databases'
    ],
    commonMistakes: [
      'Forgetting semicolon at the end of statements',
      'Using SELECT * in production code',
      'Not understanding the difference between NULL and empty string'
    ],
    problems: [
      {
        id: 'select-1',
        title: 'Basic Employee Query',
        description: 'Write a query to select all employee names from the employees table.',
        difficulty: 'Easy',
        points: 10,
        sampleInput: 'employees table with columns: id, name, department, salary',
        expectedOutput: 'All employee names',
        hint: 'Use SELECT to specify the name column from the employees table.',
        solution: 'SELECT name FROM employees;'
      },
      {
        id: 'select-2',
        title: 'Multiple Columns',
        description: 'Select employee name and salary from the employees table.',
        difficulty: 'Easy',
        points: 15,
        sampleInput: 'employees table with columns: id, name, department, salary',
        expectedOutput: 'Employee names and their salaries',
        hint: 'Separate multiple column names with commas.',
        solution: 'SELECT name, salary FROM employees;'
      },
      {
        id: 'select-3',
        title: 'Limiting Results',
        description: 'Get the first 5 employees from the employees table.',
        difficulty: 'Medium',
        points: 20,
        sampleInput: 'employees table with many rows',
        expectedOutput: 'First 5 employee records',
        hint: 'Use the LIMIT clause to restrict the number of rows.',
        solution: 'SELECT * FROM employees LIMIT 5;'
      }
    ],
    isUnlocked: true,
    isCompleted: false,
    completionPercentage: 0,
    prerequisiteIds: []
  },
  {
    id: 'where-clauses',
    title: 'WHERE Clauses',
    description: 'Learn to filter data using WHERE clauses and various comparison operators.',
    difficulty: 'Beginner',
    estimatedTime: '60 min',
    syntaxExamples: [
      {
        title: 'Basic WHERE',
        code: 'SELECT * FROM employees WHERE salary > 50000;',
        explanation: 'Filters rows based on a condition'
      },
      {
        title: 'WHERE with AND/OR',
        code: 'SELECT * FROM employees WHERE department = "IT" AND salary > 60000;',
        explanation: 'Combines multiple conditions'
      },
      {
        title: 'WHERE with LIKE',
        code: 'SELECT * FROM employees WHERE name LIKE "John%";',
        explanation: 'Pattern matching with wildcards'
      }
    ],
    tips: [
      'Use single quotes for string values in most SQL databases',
      'AND has higher precedence than OR, use parentheses for clarity',
      'NULL values require special handling with IS NULL/IS NOT NULL'
    ],
    commonMistakes: [
      'Using = instead of LIKE for pattern matching',
      'Forgetting quotes around string values',
      'Not handling NULL values properly'
    ],
    problems: [
      {
        id: 'where-1',
        title: 'Salary Filter',
        description: 'Find all employees with salary greater than 75000.',
        difficulty: 'Easy',
        points: 15,
        sampleInput: 'employees table with salary column',
        expectedOutput: 'Employees earning more than 75000',
        hint: 'Use WHERE with the > operator.',
        solution: 'SELECT * FROM employees WHERE salary > 75000;'
      },
      {
        id: 'where-2',
        title: 'Department Filter',
        description: 'Get all employees from the Engineering department.',
        difficulty: 'Easy',
        points: 15,
        sampleInput: 'employees table with department column',
        expectedOutput: 'All Engineering department employees',
        hint: 'Use WHERE with the = operator and quotes around the string.',
        solution: 'SELECT * FROM employees WHERE department = "Engineering";'
      },
      {
        id: 'where-3',
        title: 'Multiple Conditions',
        description: 'Find employees in Sales department with salary between 40000 and 80000.',
        difficulty: 'Medium',
        points: 25,
        sampleInput: 'employees table with department and salary columns',
        expectedOutput: 'Sales employees with specified salary range',
        hint: 'Use AND to combine conditions, and BETWEEN for range queries.',
        solution: 'SELECT * FROM employees WHERE department = "Sales" AND salary BETWEEN 40000 AND 80000;'
      }
    ],
    isUnlocked: false,
    isCompleted: false,
    completionPercentage: 0,
    prerequisiteIds: ['select-basics']
  },
  {
    id: 'group-by-aggregations',
    title: 'GROUP BY & Aggregations',
    description: 'Master data aggregation using GROUP BY, COUNT, SUM, AVG, and other aggregate functions.',
    difficulty: 'Intermediate',
    estimatedTime: '75 min',
    syntaxExamples: [
      {
        title: 'Basic GROUP BY',
        code: 'SELECT department, COUNT(*) FROM employees GROUP BY department;',
        explanation: 'Groups rows and counts them'
      },
      {
        title: 'Multiple Aggregations',
        code: 'SELECT department, COUNT(*), AVG(salary) FROM employees GROUP BY department;',
        explanation: 'Multiple aggregate functions in one query'
      },
      {
        title: 'HAVING Clause',
        code: 'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5;',
        explanation: 'Filters groups using HAVING'
      }
    ],
    tips: [
      'All non-aggregate columns in SELECT must be in GROUP BY',
      'Use HAVING to filter groups, WHERE to filter rows',
      'NULL values are grouped together'
    ],
    commonMistakes: [
      'Forgetting to include columns in GROUP BY',
      'Using WHERE instead of HAVING for group conditions',
      'Misunderstanding the order of execution'
    ],
    problems: [
      {
        id: 'group-1',
        title: 'Department Count',
        description: 'Count the number of employees in each department.',
        difficulty: 'Medium',
        points: 20,
        sampleInput: 'employees table with department column',
        expectedOutput: 'Department names and employee counts',
        hint: 'Use GROUP BY with COUNT(*).',
        solution: 'SELECT department, COUNT(*) FROM employees GROUP BY department;'
      },
      {
        id: 'group-2',
        title: 'Average Salary by Department',
        description: 'Calculate the average salary for each department.',
        difficulty: 'Medium',
        points: 25,
        sampleInput: 'employees table with department and salary columns',
        expectedOutput: 'Department names and average salaries',
        hint: 'Use GROUP BY with AVG() function.',
        solution: 'SELECT department, AVG(salary) FROM employees GROUP BY department;'
      },
      {
        id: 'group-3',
        title: 'Large Departments',
        description: 'Find departments with more than 10 employees.',
        difficulty: 'Hard',
        points: 30,
        sampleInput: 'employees table with department column',
        expectedOutput: 'Departments with more than 10 employees',
        hint: 'Use GROUP BY with HAVING clause.',
        solution: 'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 10;'
      }
    ],
    isUnlocked: false,
    isCompleted: false,
    completionPercentage: 0,
    prerequisiteIds: ['where-clauses']
  },
  {
    id: 'joins',
    title: 'JOINs (INNER, LEFT, RIGHT, FULL)',
    description: 'Learn to combine data from multiple tables using different types of JOIN operations.',
    difficulty: 'Intermediate',
    estimatedTime: '90 min',
    syntaxExamples: [
      {
        title: 'INNER JOIN',
        code: 'SELECT e.name, d.name FROM employees e INNER JOIN departments d ON e.dept_id = d.id;',
        explanation: 'Returns only matching rows from both tables'
      },
      {
        title: 'LEFT JOIN',
        code: 'SELECT e.name, d.name FROM employees e LEFT JOIN departments d ON e.dept_id = d.id;',
        explanation: 'Returns all rows from left table, matching rows from right'
      },
      {
        title: 'Multiple JOINs',
        code: 'SELECT e.name, d.name, p.title FROM employees e JOIN departments d ON e.dept_id = d.id JOIN projects p ON e.project_id = p.id;',
        explanation: 'Joining multiple tables together'
      }
    ],
    tips: [
      'Use table aliases to make queries more readable',
      'Understand the difference between JOIN types',
      'Always specify the JOIN condition with ON clause'
    ],
    commonMistakes: [
      'Forgetting the ON clause in JOINs',
      'Using wrong JOIN type for the desired result',
      'Creating accidental Cartesian products'
    ],
    problems: [
      {
        id: 'join-1',
        title: 'Employee Departments',
        description: 'Join employees and departments tables to show employee names with their department names.',
        difficulty: 'Medium',
        points: 25,
        sampleInput: 'employees and departments tables',
        expectedOutput: 'Employee names with department names',
        hint: 'Use INNER JOIN with ON clause.',
        solution: 'SELECT e.name, d.name FROM employees e INNER JOIN departments d ON e.dept_id = d.id;'
      },
      {
        id: 'join-2',
        title: 'All Employees with Departments',
        description: 'Show all employees, including those without assigned departments.',
        difficulty: 'Medium',
        points: 30,
        sampleInput: 'employees and departments tables',
        expectedOutput: 'All employees with department names (NULL if no department)',
        hint: 'Use LEFT JOIN to include all employees.',
        solution: 'SELECT e.name, d.name FROM employees e LEFT JOIN departments d ON e.dept_id = d.id;'
      },
      {
        id: 'join-3',
        title: 'Three Table Join',
        description: 'Join employees, departments, and projects to show employee, department, and project information.',
        difficulty: 'Hard',
        points: 35,
        sampleInput: 'employees, departments, and projects tables',
        expectedOutput: 'Employee, department, and project information',
        hint: 'Chain multiple JOIN operations.',
        solution: 'SELECT e.name, d.name, p.title FROM employees e JOIN departments d ON e.dept_id = d.id JOIN projects p ON e.project_id = p.id;'
      }
    ],
    isUnlocked: false,
    isCompleted: false,
    completionPercentage: 0,
    prerequisiteIds: ['group-by-aggregations']
  },
  {
    id: 'subqueries',
    title: 'Subqueries',
    description: 'Master the art of nested queries and subqueries for complex data retrieval.',
    difficulty: 'Advanced',
    estimatedTime: '85 min',
    syntaxExamples: [
      {
        title: 'Subquery in WHERE',
        code: 'SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);',
        explanation: 'Using subquery to filter based on calculated value'
      },
      {
        title: 'Correlated Subquery',
        code: 'SELECT * FROM employees e1 WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e1.dept_id);',
        explanation: 'Subquery that references outer query'
      },
      {
        title: 'EXISTS Subquery',
        code: 'SELECT * FROM departments WHERE EXISTS (SELECT 1 FROM employees WHERE dept_id = departments.id);',
        explanation: 'Using EXISTS to check for related records'
      }
    ],
    tips: [
      'Subqueries can be used in SELECT, FROM, WHERE, and HAVING clauses',
      'Correlated subqueries are executed once for each row in the outer query',
      'EXISTS is often more efficient than IN for checking existence'
    ],
    commonMistakes: [
      'Writing inefficient correlated subqueries',
      'Not understanding the execution order',
      'Using subqueries when JOINs would be more efficient'
    ],
    problems: [
      {
        id: 'subquery-1',
        title: 'Above Average Salary',
        description: 'Find all employees with salary above the company average.',
        difficulty: 'Medium',
        points: 30,
        sampleInput: 'employees table with salary column',
        expectedOutput: 'Employees with above-average salary',
        hint: 'Use a subquery with AVG() function in WHERE clause.',
        solution: 'SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);'
      },
      {
        id: 'subquery-2',
        title: 'Department with Most Employees',
        description: 'Find the department(s) with the highest number of employees.',
        difficulty: 'Hard',
        points: 35,
        sampleInput: 'employees table with department information',
        expectedOutput: 'Department(s) with maximum employee count',
        hint: 'Use subquery with MAX() and COUNT() functions.',
        solution: 'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) = (SELECT MAX(emp_count) FROM (SELECT COUNT(*) as emp_count FROM employees GROUP BY department) as dept_counts);'
      },
      {
        id: 'subquery-3',
        title: 'Departments with Employees',
        description: 'List all departments that have at least one employee.',
        difficulty: 'Medium',
        points: 25,
        sampleInput: 'departments and employees tables',
        expectedOutput: 'Departments that have employees',
        hint: 'Use EXISTS with a correlated subquery.',
        solution: 'SELECT * FROM departments WHERE EXISTS (SELECT 1 FROM employees WHERE dept_id = departments.id);'
      }
    ],
    isUnlocked: false,
    isCompleted: false,
    completionPercentage: 0,
    prerequisiteIds: ['joins']
  },
  {
    id: 'advanced-functions',
    title: 'Advanced Functions & Window Functions',
    description: 'Explore advanced SQL functions, window functions, and analytical queries.',
    difficulty: 'Advanced',
    estimatedTime: '120 min',
    syntaxExamples: [
      {
        title: 'ROW_NUMBER()',
        code: 'SELECT name, salary, ROW_NUMBER() OVER (ORDER BY salary DESC) as rank FROM employees;',
        explanation: 'Assigns unique sequential numbers to rows'
      },
      {
        title: 'PARTITION BY',
        code: 'SELECT name, department, salary, RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank FROM employees;',
        explanation: 'Window function with partitioning'
      },
      {
        title: 'LAG/LEAD',
        code: 'SELECT name, salary, LAG(salary) OVER (ORDER BY hire_date) as prev_salary FROM employees;',
        explanation: 'Access previous/next row values'
      }
    ],
    tips: [
      'Window functions operate on a set of rows related to the current row',
      'PARTITION BY divides the result set into partitions',
      'Use ROWS or RANGE to define the window frame'
    ],
    commonMistakes: [
      'Confusing window functions with aggregate functions',
      'Not understanding the difference between RANK() and ROW_NUMBER()',
      'Incorrect window frame specifications'
    ],
    problems: [
      {
        id: 'advanced-1',
        title: 'Employee Ranking',
        description: 'Rank employees by salary within each department.',
        difficulty: 'Hard',
        points: 40,
        sampleInput: 'employees table with department and salary',
        expectedOutput: 'Employees with their rank within department',
        hint: 'Use RANK() with PARTITION BY department.',
        solution: 'SELECT name, department, salary, RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank FROM employees;'
      },
      {
        id: 'advanced-2',
        title: 'Running Total',
        description: 'Calculate running total of salaries ordered by hire date.',
        difficulty: 'Hard',
        points: 45,
        sampleInput: 'employees table with salary and hire_date',
        expectedOutput: 'Employees with running total of salaries',
        hint: 'Use SUM() as a window function with appropriate frame.',
        solution: 'SELECT name, hire_date, salary, SUM(salary) OVER (ORDER BY hire_date ROWS UNBOUNDED PRECEDING) as running_total FROM employees;'
      },
      {
        id: 'advanced-3',
        title: 'Previous Salary Comparison',
        description: 'Show each employee\'s current salary and their previous colleague\'s salary (by hire date).',
        difficulty: 'Hard',
        points: 50,
        sampleInput: 'employees table with salary and hire_date',
        expectedOutput: 'Employees with current and previous salary',
        hint: 'Use LAG() function to access previous row.',
        solution: 'SELECT name, hire_date, salary, LAG(salary) OVER (ORDER BY hire_date) as prev_salary FROM employees;'
      }
    ],
    isUnlocked: false,
    isCompleted: false,
    completionPercentage: 0,
    prerequisiteIds: ['subqueries']
  }
];

export default function LearningPathPage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>(LEARNING_PATH_DATA);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<LessonProblem | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);

  // Load user progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('learningPathProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setUserProgress(progress);
      
      // Update lessons with saved progress
      const updatedLessons = lessons.map(lesson => {
        const lessonProgress = progress[lesson.id] || {};
        const completedProblems = lessonProgress.completedProblems || [];
        const completionPercentage = (completedProblems.length / lesson.problems.length) * 100;
        const isCompleted = completionPercentage === 100;
        
        // Check if lesson should be unlocked
        const prerequisitesMet = lesson.prerequisiteIds.every(prereqId => {
          const prereqProgress = progress[prereqId] || {};
          const prereqCompletedProblems = prereqProgress.completedProblems || [];
          const prereqLesson = lessons.find(l => l.id === prereqId);
          return prereqLesson ? (prereqCompletedProblems.length === prereqLesson.problems.length) : false;
        });
        
        return {
          ...lesson,
          isCompleted,
          completionPercentage,
          isUnlocked: lesson.id === 'select-basics' || prerequisitesMet
        };
      });
      
      setLessons(updatedLessons);
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (lessonId: string, problemId: string) => {
    const newProgress = { ...userProgress };
    if (!newProgress[lessonId]) {
      newProgress[lessonId] = { completedProblems: [] };
    }
    
    if (!newProgress[lessonId].completedProblems.includes(problemId)) {
      newProgress[lessonId].completedProblems.push(problemId);
    }
    
    setUserProgress(newProgress);
    localStorage.setItem('learningPathProgress', JSON.stringify(newProgress));
    
    // Update lessons state
    const updatedLessons = lessons.map(lesson => {
      if (lesson.id === lessonId) {
        const completedProblems = newProgress[lessonId].completedProblems;
        const completionPercentage = (completedProblems.length / lesson.problems.length) * 100;
        const isCompleted = completionPercentage === 100;
        
        return {
          ...lesson,
          isCompleted,
          completionPercentage
        };
      }
      return lesson;
    });
    
    setLessons(updatedLessons);
    
    // Check if this completion unlocks next lesson
    const currentLesson = lessons.find(l => l.id === lessonId);
    if (currentLesson) {
      const completedProblems = newProgress[lessonId].completedProblems;
      if (completedProblems.length === currentLesson.problems.length) {
        // Lesson completed, check for unlocking next lessons
        const nextLessons = lessons.filter(l => l.prerequisiteIds.includes(lessonId));
        nextLessons.forEach(nextLesson => {
          const prerequisitesMet = nextLesson.prerequisiteIds.every(prereqId => {
            const prereqProgress = newProgress[prereqId] || {};
            const prereqCompletedProblems = prereqProgress.completedProblems || [];
            const prereqLessonData = lessons.find(l => l.id === prereqId);
            return prereqLessonData ? (prereqCompletedProblems.length === prereqLessonData.problems.length) : false;
          });
          
          if (prerequisitesMet) {
            setShowSuccessMessage(`Great! You unlocked "${nextLesson.title}"!`);
            setTimeout(() => setShowSuccessMessage(null), 3000);
          }
        });
      }
    }
  };

  // Execute SQL query
  const executeQuery = async () => {
    if (!userQuery.trim() || !selectedProblem) return;
    
    setIsExecuting(true);
    setQueryResult(null);
    
    try {
      const response = await fetch('/api/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userQuery.trim(),
          database: 'sample'
        })
      });
      
      const data = await response.json();
      setQueryResult(data);
      
      // Check if query is correct (simplified check)
      if (data.success && selectedLesson && selectedProblem) {
        const normalizedUserQuery = userQuery.trim().toLowerCase().replace(/\s+/g, ' ');
        const normalizedExpectedQuery = selectedProblem.solution.toLowerCase().replace(/\s+/g, ' ');
        
        // For demo purposes, we'll consider the query correct if it contains key elements
        const isCorrect = normalizedUserQuery.includes('select') && 
                         normalizedUserQuery.includes('from') &&
                         data.data && data.data.length > 0;
        
        if (isCorrect) {
          saveProgress(selectedLesson.id, selectedProblem.id);
          setShowSuccessMessage(`Correct! You earned ${selectedProblem.points} points!`);
          setTimeout(() => setShowSuccessMessage(null), 3000);
        }
      }
    } catch (error) {
      console.error('Query execution error:', error);
      setQueryResult({
        success: false,
        error: 'Failed to execute query. Please try again.'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Calculate overall progress
  const overallProgress = lessons.length > 0 ? 
    (lessons.reduce((sum, lesson) => sum + lesson.completionPercentage, 0) / lessons.length) : 0;

  const completedLessons = lessons.filter(l => l.isCompleted).length;
  const totalPoints = Object.values(userProgress).reduce((total, lessonProgress: any) => {
    return total + (lessonProgress.completedProblems?.length || 0) * 10; // Simplified point calculation
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation Bar */}
      <ResponsiveNavbar />

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in">
          <CheckCircle className="w-5 h-5" />
          <span>{showSuccessMessage}</span>
        </div>
      )}

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Learning Path Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-slate-800 border-r border-slate-700 transition-all duration-300 overflow-y-auto`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              {!sidebarCollapsed && (
                <div>
                  <h2 className="text-xl font-bold text-white">Learning Path</h2>
                  <div className="text-sm text-slate-400 mt-1">
                    {completedLessons}/{lessons.length} lessons completed
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {sidebarCollapsed ? <Menu className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
              </button>
            </div>

            {/* Lessons Timeline */}
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="relative">
                  {/* Timeline Line */}
                  {index < lessons.length - 1 && (
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-slate-600" />
                  )}
                  
                  <div
                    className={`relative cursor-pointer group ${sidebarCollapsed ? 'p-2' : 'p-4'} rounded-lg border transition-all duration-200 ${
                      lesson.isCompleted
                        ? 'bg-green-900/30 border-green-500/50 hover:bg-green-900/50'
                        : lesson.isUnlocked
                        ? selectedLesson?.id === lesson.id
                          ? 'bg-blue-900/50 border-blue-400'
                          : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                        : 'bg-slate-800/50 border-slate-700 opacity-60'
                    }`}
                    onClick={() => lesson.isUnlocked && setSelectedLesson(lesson)}
                  >
                    {/* Status Icon */}
                    <div className="absolute left-4 top-4 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-slate-800">
                      {lesson.isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : lesson.isUnlocked ? (
                        <Circle className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-500" />
                      )}
                    </div>

                    {!sidebarCollapsed && (
                      <div className="ml-12">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white text-sm">
                            {lesson.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            lesson.difficulty === 'Beginner' ? 'bg-green-900 text-green-300' :
                            lesson.difficulty === 'Intermediate' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {lesson.difficulty}
                          </span>
                        </div>
                        
                        <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                          {lesson.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{lesson.estimatedTime}</span>
                          </div>
                          <span>{Math.round(lesson.completionPercentage)}%</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              lesson.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${lesson.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {selectedLesson ? (
            selectedProblem ? (
              /* Problem Solving View */
              <div className="h-full flex flex-col">
                {/* Problem Header */}
                <div className="bg-slate-800 border-b border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setSelectedProblem(null)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      ← Back to {selectedLesson.title}
                    </button>
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedProblem.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                        selectedProblem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                      }`}>
                        {selectedProblem.difficulty}
                      </span>
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">{selectedProblem.points} points</span>
                      </div>
                    </div>
                  </div>
                  
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {selectedProblem.title}
                  </h1>
                  <p className="text-slate-300">
                    {selectedProblem.description}
                  </p>
                </div>

                {/* Problem Content */}
                <div className="flex-1 flex">
                  {/* Left: Problem Details */}
                  <div className="w-1/2 p-6 border-r border-slate-700">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Sample Input</h3>
                        <div className="bg-slate-900 rounded-lg p-4">
                          <code className="text-slate-300 text-sm">
                            {selectedProblem.sampleInput}
                          </code>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Expected Output</h3>
                        <div className="bg-slate-900 rounded-lg p-4">
                          <code className="text-slate-300 text-sm">
                            {selectedProblem.expectedOutput}
                          </code>
                        </div>
                      </div>
                      
                      {/* Hint Section */}
                      {selectedProblem.hint && (
                        <div>
                          <button
                            onClick={() => setShowHint(!showHint)}
                            className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors mb-3"
                          >
                            <Lightbulb className="w-5 h-5" />
                            <span>Show Hint</span>
                            {showHint ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          
                          {showHint && (
                            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                              <p className="text-yellow-200 text-sm">
                                {selectedProblem.hint}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Solution Section */}
                      <div>
                        <button
                          onClick={() => setShowSolution(!showSolution)}
                          className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors mb-3"
                        >
                          {showSolution ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          <span>{showSolution ? 'Hide' : 'Show'} Solution</span>
                        </button>
                        
                        {showSolution && (
                          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                            <code className="text-red-200 text-sm">
                              {selectedProblem.solution}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: SQL Editor */}
                  <div className="w-1/2 flex flex-col">
                    <div className="p-6 border-b border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Your SQL Query</h3>
                      <textarea
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-200 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                        placeholder="Write your SQL query here..."
                      />
                      
                      <button
                        onClick={executeQuery}
                        disabled={isExecuting || !userQuery.trim()}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>{isExecuting ? 'Running...' : 'Run & Check'}</span>
                      </button>
                    </div>

                    {/* Query Results */}
                    <div className="flex-1 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Results</h3>
                      
                      {queryResult ? (
                        <div className="bg-slate-900 rounded-lg p-4 h-full">
                          {queryResult.success ? (
                            <div>
                              <div className="text-green-400 text-sm mb-2">
                                ✓ Query executed successfully
                              </div>
                              {queryResult.data && queryResult.data.length > 0 ? (
                                <div className="overflow-auto max-h-64">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-slate-700">
                                        {Object.keys(queryResult.data[0]).map((column) => (
                                          <th key={column} className="text-left text-slate-300 p-2">
                                            {column}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {queryResult.data.map((row: any, index: number) => (
                                        <tr key={index} className="border-b border-slate-800">
                                          {Object.values(row).map((value: any, i: number) => (
                                            <td key={i} className="text-slate-200 p-2">
                                              {value !== null ? String(value) : 'NULL'}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-slate-400">No data returned</div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="text-red-400 text-sm mb-2">
                                ✗ Query failed
                              </div>
                              <div className="text-red-300 text-sm">
                                {queryResult.error}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-900 rounded-lg p-4 h-full flex items-center justify-center">
                          <div className="text-slate-500 text-center">
                            <Code className="w-8 h-8 mx-auto mb-2" />
                            <p>Run your query to see results</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Lesson Overview */
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  {/* Lesson Header */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <h1 className="text-3xl font-bold text-white">
                          {selectedLesson.title}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          selectedLesson.difficulty === 'Beginner' ? 'bg-green-900 text-green-300' :
                          selectedLesson.difficulty === 'Intermediate' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {selectedLesson.difficulty}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{selectedLesson.estimatedTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{Math.round(selectedLesson.completionPercentage)}% Complete</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 text-lg mb-6">
                      {selectedLesson.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          selectedLesson.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${selectedLesson.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Syntax Examples */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                      <Code className="w-6 h-6" />
                      <span>Syntax & Examples</span>
                    </h2>
                    
                    <div className="grid gap-4">
                      {selectedLesson.syntaxExamples.map((example, index) => (
                        <div key={index} className="bg-slate-800 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {example.title}
                          </h3>
                          <div className="bg-slate-900 rounded-lg p-4 mb-3">
                            <code className="text-blue-300 font-mono">
                              {example.code}
                            </code>
                          </div>
                          <p className="text-slate-400">
                            {example.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips and Common Mistakes */}
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                        <Lightbulb className="w-6 h-6 text-yellow-400" />
                        <span>Tips & Best Practices</span>
                      </h2>
                      
                      <div className="space-y-3">
                        {selectedLesson.tips.map((tip, index) => (
                          <div key={index} className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                            <p className="text-yellow-200">
                              {tip}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                        <Target className="w-6 h-6 text-red-400" />
                        <span>Common Mistakes</span>
                      </h2>
                      
                      <div className="space-y-3">
                        {selectedLesson.commonMistakes.map((mistake, index) => (
                          <div key={index} className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                            <p className="text-red-200">
                              {mistake}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Practice Problems */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                      <BookOpen className="w-6 h-6" />
                      <span>Practice Problems</span>
                    </h2>
                    
                    <div className="grid gap-4">
                      {selectedLesson.problems.map((problem) => {
                        const isCompleted = userProgress[selectedLesson.id]?.completedProblems?.includes(problem.id) || false;
                        
                        return (
                          <div 
                            key={problem.id}
                            className={`bg-slate-800 rounded-lg p-6 border transition-all duration-200 cursor-pointer hover:bg-slate-700/50 ${
                              isCompleted ? 'border-green-500/50' : 'border-slate-600'
                            }`}
                            onClick={() => setSelectedProblem(problem)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {isCompleted ? (
                                  <CheckCircle className="w-6 h-6 text-green-400" />
                                ) : (
                                  <Circle className="w-6 h-6 text-slate-400" />
                                )}
                                <h3 className="text-lg font-semibold text-white">
                                  {problem.title}
                                </h3>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  problem.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                                  problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                                  'bg-red-900 text-red-300'
                                }`}>
                                  {problem.difficulty}
                                </span>
                                <div className="flex items-center space-x-1 text-yellow-400">
                                  <Star className="w-4 h-4" />
                                  <span className="text-sm">{problem.points}</span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-slate-300 mb-4">
                              {problem.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-slate-400 text-sm">
                                Click to start solving
                              </div>
                              {isCompleted && (
                                <div className="flex items-center space-x-1 text-green-400 text-sm">
                                  <Award className="w-4 h-4" />
                                  <span>Completed</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Welcome Screen */
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl mx-auto p-8">
                <div className="mb-8">
                  <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-white mb-4">
                    Welcome to SQL Learning Path
                  </h1>
                  <p className="text-slate-300 text-lg">
                    Follow our structured curriculum to master SQL from basics to advanced concepts.
                    Each lesson builds upon the previous one with hands-on practice problems.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-800 rounded-lg p-6">
                    <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Structured Learning
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Progressive lessons from beginner to advanced levels
                    </p>
                  </div>
                  
                  <div className="bg-slate-800 rounded-lg p-6">
                    <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Earn Points
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Complete problems to earn points and unlock achievements
                    </p>
                  </div>
                  
                  <div className="bg-slate-800 rounded-lg p-6">
                    <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Track Progress
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Monitor your learning journey with detailed progress tracking
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{completedLessons}</div>
                      <div className="text-slate-400 text-sm">Lessons Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">{totalPoints}</div>
                      <div className="text-slate-400 text-sm">Total Points</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">{Math.round(overallProgress)}%</div>
                      <div className="text-slate-400 text-sm">Overall Progress</div>
                    </div>
                  </div>
                </div>

                <p className="text-slate-400 mt-6">
                  Select a lesson from the sidebar to get started!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

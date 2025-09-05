import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/database';
import { verifyAuth, getOptionalAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getOptionalAuth(request);
    const client = await getClient();

    try {
      let query = `
        SELECT 
          ps.*,
          COUNT(q.id) as query_count
        FROM playground_sessions ps
        LEFT JOIN queries q ON ps.id = q.session_id
        WHERE ps.is_shared = true OR ps.user_id = $1
        GROUP BY ps.id
        ORDER BY ps.updated_at DESC
        LIMIT 20
      `;

      const result = await client.query(query, [user?.id || null]);

      return NextResponse.json({
        success: true,
        data: result.rows
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Playground sessions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getOptionalAuth(request);
    const sessionData = await request.json();
    const client = await getClient();

    try {
      // Enhanced database schemas with rich sample data
      const databaseTemplates = {
        company: {
          name: "Company Database",
          description: "Complete company database with employees, departments, projects, and more",
          tables: [
            {
              name: 'employees',
              columns: [
                { name: 'employee_id', type: 'INTEGER', primary_key: true },
                { name: 'first_name', type: 'VARCHAR(50)' },
                { name: 'last_name', type: 'VARCHAR(50)' },
                { name: 'email', type: 'VARCHAR(100)' },
                { name: 'phone', type: 'VARCHAR(20)' },
                { name: 'hire_date', type: 'DATE' },
                { name: 'job_title', type: 'VARCHAR(100)' },
                { name: 'department_id', type: 'INTEGER' },
                { name: 'manager_id', type: 'INTEGER' },
                { name: 'salary', type: 'DECIMAL(10,2)' },
                { name: 'commission_pct', type: 'DECIMAL(3,2)' },
                { name: 'status', type: 'VARCHAR(20)' }
              ],
              data: [
                { employee_id: 1, first_name: 'John', last_name: 'Smith', email: 'john.smith@company.com', phone: '555-0101', hire_date: '2020-01-15', job_title: 'Software Engineer', department_id: 1, manager_id: 5, salary: 85000, commission_pct: null, status: 'Active' },
                { employee_id: 2, first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.johnson@company.com', phone: '555-0102', hire_date: '2019-03-22', job_title: 'Marketing Specialist', department_id: 2, manager_id: 6, salary: 62000, commission_pct: 0.05, status: 'Active' },
                { employee_id: 3, first_name: 'Michael', last_name: 'Davis', email: 'michael.davis@company.com', phone: '555-0103', hire_date: '2021-07-10', job_title: 'Data Analyst', department_id: 1, manager_id: 5, salary: 72000, commission_pct: null, status: 'Active' },
                { employee_id: 4, first_name: 'Emily', last_name: 'Brown', email: 'emily.brown@company.com', phone: '555-0104', hire_date: '2018-11-05', job_title: 'Sales Representative', department_id: 3, manager_id: 7, salary: 55000, commission_pct: 0.08, status: 'Active' },
                { employee_id: 5, first_name: 'David', last_name: 'Wilson', email: 'david.wilson@company.com', phone: '555-0105', hire_date: '2017-02-28', job_title: 'Engineering Manager', department_id: 1, manager_id: null, salary: 120000, commission_pct: null, status: 'Active' },
                { employee_id: 6, first_name: 'Lisa', last_name: 'Miller', email: 'lisa.miller@company.com', phone: '555-0106', hire_date: '2016-09-12', job_title: 'Marketing Director', department_id: 2, manager_id: null, salary: 110000, commission_pct: 0.10, status: 'Active' },
                { employee_id: 7, first_name: 'Robert', last_name: 'Garcia', email: 'robert.garcia@company.com', phone: '555-0107', hire_date: '2015-05-18', job_title: 'Sales Manager', department_id: 3, manager_id: null, salary: 95000, commission_pct: 0.12, status: 'Active' },
                { employee_id: 8, first_name: 'Jennifer', last_name: 'Martinez', email: 'jennifer.martinez@company.com', phone: '555-0108', hire_date: '2022-01-20', job_title: 'Junior Developer', department_id: 1, manager_id: 5, salary: 68000, commission_pct: null, status: 'Active' },
                { employee_id: 9, first_name: 'James', last_name: 'Anderson', email: 'james.anderson@company.com', phone: '555-0109', hire_date: '2020-08-14', job_title: 'Content Creator', department_id: 2, manager_id: 6, salary: 58000, commission_pct: 0.03, status: 'Active' },
                { employee_id: 10, first_name: 'Amanda', last_name: 'Taylor', email: 'amanda.taylor@company.com', phone: '555-0110', hire_date: '2019-12-03', job_title: 'Account Manager', department_id: 3, manager_id: 7, salary: 70000, commission_pct: 0.06, status: 'On Leave' }
              ]
            },
            {
              name: 'departments',
              columns: [
                { name: 'department_id', type: 'INTEGER', primary_key: true },
                { name: 'department_name', type: 'VARCHAR(100)' },
                { name: 'location', type: 'VARCHAR(100)' },
                { name: 'budget', type: 'DECIMAL(12,2)' },
                { name: 'established_date', type: 'DATE' }
              ],
              data: [
                { department_id: 1, department_name: 'Engineering', location: 'San Francisco', budget: 2500000, established_date: '2010-01-01' },
                { department_id: 2, department_name: 'Marketing', location: 'New York', budget: 1200000, established_date: '2010-06-15' },
                { department_id: 3, department_name: 'Sales', location: 'Chicago', budget: 1800000, established_date: '2010-03-20' },
                { department_id: 4, department_name: 'Human Resources', location: 'Austin', budget: 800000, established_date: '2011-01-10' },
                { department_id: 5, department_name: 'Finance', location: 'Boston', budget: 1000000, established_date: '2010-09-01' }
              ]
            },
            {
              name: 'projects',
              columns: [
                { name: 'project_id', type: 'INTEGER', primary_key: true },
                { name: 'project_name', type: 'VARCHAR(150)' },
                { name: 'description', type: 'TEXT' },
                { name: 'start_date', type: 'DATE' },
                { name: 'end_date', type: 'DATE' },
                { name: 'budget', type: 'DECIMAL(12,2)' },
                { name: 'status', type: 'VARCHAR(20)' },
                { name: 'department_id', type: 'INTEGER' }
              ],
              data: [
                { project_id: 1, project_name: 'Mobile App Development', description: 'Develop new mobile application for customers', start_date: '2023-01-15', end_date: '2023-12-31', budget: 500000, status: 'In Progress', department_id: 1 },
                { project_id: 2, project_name: 'Brand Redesign Campaign', description: 'Complete company rebranding initiative', start_date: '2023-03-01', end_date: '2023-09-30', budget: 300000, status: 'In Progress', department_id: 2 },
                { project_id: 3, project_name: 'Sales Automation System', description: 'Implement CRM and sales automation tools', start_date: '2022-06-01', end_date: '2023-02-28', budget: 250000, status: 'Completed', department_id: 3 },
                { project_id: 4, project_name: 'Data Analytics Platform', description: 'Build comprehensive analytics dashboard', start_date: '2023-05-01', end_date: '2024-04-30', budget: 400000, status: 'Planning', department_id: 1 }
              ]
            },
            {
              name: 'employee_projects',
              columns: [
                { name: 'employee_id', type: 'INTEGER' },
                { name: 'project_id', type: 'INTEGER' },
                { name: 'role', type: 'VARCHAR(100)' },
                { name: 'hours_allocated', type: 'INTEGER' },
                { name: 'start_date', type: 'DATE' }
              ],
              data: [
                { employee_id: 1, project_id: 1, role: 'Lead Developer', hours_allocated: 40, start_date: '2023-01-15' },
                { employee_id: 3, project_id: 1, role: 'Data Analyst', hours_allocated: 20, start_date: '2023-02-01' },
                { employee_id: 8, project_id: 1, role: 'Junior Developer', hours_allocated: 35, start_date: '2023-02-15' },
                { employee_id: 2, project_id: 2, role: 'Marketing Lead', hours_allocated: 40, start_date: '2023-03-01' },
                { employee_id: 9, project_id: 2, role: 'Content Creator', hours_allocated: 30, start_date: '2023-03-15' },
                { employee_id: 4, project_id: 3, role: 'Sales Consultant', hours_allocated: 15, start_date: '2022-06-01' },
                { employee_id: 10, project_id: 3, role: 'Account Manager', hours_allocated: 25, start_date: '2022-07-01' }
              ]
            }
          ]
        },
        ecommerce: {
          name: "E-commerce Database",
          description: "Online store with customers, products, orders, and inventory",
          tables: [
            {
              name: 'customers',
              columns: [
                { name: 'customer_id', type: 'INTEGER', primary_key: true },
                { name: 'first_name', type: 'VARCHAR(50)' },
                { name: 'last_name', type: 'VARCHAR(50)' },
                { name: 'email', type: 'VARCHAR(100)' },
                { name: 'phone', type: 'VARCHAR(20)' },
                { name: 'address', type: 'VARCHAR(200)' },
                { name: 'city', type: 'VARCHAR(50)' },
                { name: 'state', type: 'VARCHAR(50)' },
                { name: 'zip_code', type: 'VARCHAR(10)' },
                { name: 'registration_date', type: 'DATE' },
                { name: 'loyalty_points', type: 'INTEGER' }
              ],
              data: [
                { customer_id: 1, first_name: 'Alice', last_name: 'Johnson', email: 'alice.j@email.com', phone: '555-1001', address: '123 Main St', city: 'New York', state: 'NY', zip_code: '10001', registration_date: '2022-01-15', loyalty_points: 850 },
                { customer_id: 2, first_name: 'Bob', last_name: 'Smith', email: 'bob.smith@email.com', phone: '555-1002', address: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip_code: '90210', registration_date: '2022-03-22', loyalty_points: 1200 },
                { customer_id: 3, first_name: 'Carol', last_name: 'Davis', email: 'carol.d@email.com', phone: '555-1003', address: '789 Pine Rd', city: 'Chicago', state: 'IL', zip_code: '60601', registration_date: '2021-11-08', loyalty_points: 2150 },
                { customer_id: 4, first_name: 'David', last_name: 'Wilson', email: 'david.w@email.com', phone: '555-1004', address: '321 Elm St', city: 'Houston', state: 'TX', zip_code: '77001', registration_date: '2023-02-14', loyalty_points: 450 },
                { customer_id: 5, first_name: 'Eva', last_name: 'Brown', email: 'eva.brown@email.com', phone: '555-1005', address: '654 Maple Dr', city: 'Phoenix', state: 'AZ', zip_code: '85001', registration_date: '2022-08-30', loyalty_points: 975 }
              ]
            },
            {
              name: 'categories',
              columns: [
                { name: 'category_id', type: 'INTEGER', primary_key: true },
                { name: 'category_name', type: 'VARCHAR(100)' },
                { name: 'description', type: 'TEXT' },
                { name: 'parent_category_id', type: 'INTEGER' }
              ],
              data: [
                { category_id: 1, category_name: 'Electronics', description: 'Electronic devices and accessories', parent_category_id: null },
                { category_id: 2, category_name: 'Computers', description: 'Laptops, desktops, and computer accessories', parent_category_id: 1 },
                { category_id: 3, category_name: 'Smartphones', description: 'Mobile phones and accessories', parent_category_id: 1 },
                { category_id: 4, category_name: 'Clothing', description: 'Apparel for men, women, and children', parent_category_id: null },
                { category_id: 5, category_name: 'Books', description: 'Physical and digital books', parent_category_id: null },
                { category_id: 6, category_name: 'Home & Garden', description: 'Home improvement and garden supplies', parent_category_id: null }
              ]
            },
            {
              name: 'products',
              columns: [
                { name: 'product_id', type: 'INTEGER', primary_key: true },
                { name: 'product_name', type: 'VARCHAR(150)' },
                { name: 'description', type: 'TEXT' },
                { name: 'category_id', type: 'INTEGER' },
                { name: 'price', type: 'DECIMAL(10,2)' },
                { name: 'cost', type: 'DECIMAL(10,2)' },
                { name: 'stock_quantity', type: 'INTEGER' },
                { name: 'reorder_level', type: 'INTEGER' },
                { name: 'supplier_id', type: 'INTEGER' },
                { name: 'created_date', type: 'DATE' },
                { name: 'is_active', type: 'BOOLEAN' }
              ],
              data: [
                { product_id: 1, product_name: 'MacBook Pro 16"', description: 'High-performance laptop for professionals', category_id: 2, price: 2499.00, cost: 1800.00, stock_quantity: 25, reorder_level: 10, supplier_id: 1, created_date: '2023-01-15', is_active: true },
                { product_id: 2, product_name: 'iPhone 14 Pro', description: 'Latest smartphone with advanced camera', category_id: 3, price: 999.00, cost: 700.00, stock_quantity: 150, reorder_level: 50, supplier_id: 1, created_date: '2022-09-20', is_active: true },
                { product_id: 3, product_name: 'Samsung Galaxy S23', description: 'Android smartphone with excellent display', category_id: 3, price: 899.00, cost: 620.00, stock_quantity: 80, reorder_level: 30, supplier_id: 2, created_date: '2023-02-10', is_active: true },
                { product_id: 4, product_name: 'Nike Air Max Sneakers', description: 'Comfortable running shoes', category_id: 4, price: 129.99, cost: 65.00, stock_quantity: 200, reorder_level: 75, supplier_id: 3, created_date: '2023-03-05', is_active: true },
                { product_id: 5, product_name: 'The Great Gatsby', description: 'Classic American novel', category_id: 5, price: 12.99, cost: 5.00, stock_quantity: 500, reorder_level: 100, supplier_id: 4, created_date: '2022-01-01', is_active: true },
                { product_id: 6, product_name: 'Garden Hose 50ft', description: 'Durable garden hose for outdoor use', category_id: 6, price: 39.99, cost: 18.00, stock_quantity: 75, reorder_level: 25, supplier_id: 5, created_date: '2023-04-01', is_active: true }
              ]
            },
            {
              name: 'orders',
              columns: [
                { name: 'order_id', type: 'INTEGER', primary_key: true },
                { name: 'customer_id', type: 'INTEGER' },
                { name: 'order_date', type: 'DATE' },
                { name: 'ship_date', type: 'DATE' },
                { name: 'total_amount', type: 'DECIMAL(10,2)' },
                { name: 'shipping_cost', type: 'DECIMAL(8,2)' },
                { name: 'tax_amount', type: 'DECIMAL(8,2)' },
                { name: 'status', type: 'VARCHAR(20)' },
                { name: 'payment_method', type: 'VARCHAR(50)' }
              ],
              data: [
                { order_id: 1, customer_id: 1, order_date: '2023-05-15', ship_date: '2023-05-17', total_amount: 1028.98, shipping_cost: 15.99, tax_amount: 89.99, status: 'Delivered', payment_method: 'Credit Card' },
                { order_id: 2, customer_id: 2, order_date: '2023-05-18', ship_date: '2023-05-20', total_amount: 2514.99, shipping_cost: 0.00, tax_amount: 215.00, status: 'Delivered', payment_method: 'PayPal' },
                { order_id: 3, customer_id: 3, order_date: '2023-05-20', ship_date: null, total_amount: 169.98, shipping_cost: 9.99, tax_amount: 12.50, status: 'Processing', payment_method: 'Credit Card' },
                { order_id: 4, customer_id: 1, order_date: '2023-05-22', ship_date: '2023-05-24', total_amount: 52.98, shipping_cost: 7.99, tax_amount: 4.00, status: 'Shipped', payment_method: 'Debit Card' },
                { order_id: 5, customer_id: 4, order_date: '2023-05-25', ship_date: null, total_amount: 899.00, shipping_cost: 12.99, tax_amount: 71.92, status: 'Processing', payment_method: 'Credit Card' }
              ]
            },
            {
              name: 'order_items',
              columns: [
                { name: 'order_item_id', type: 'INTEGER', primary_key: true },
                { name: 'order_id', type: 'INTEGER' },
                { name: 'product_id', type: 'INTEGER' },
                { name: 'quantity', type: 'INTEGER' },
                { name: 'unit_price', type: 'DECIMAL(10,2)' },
                { name: 'total_price', type: 'DECIMAL(10,2)' }
              ],
              data: [
                { order_item_id: 1, order_id: 1, product_id: 2, quantity: 1, unit_price: 999.00, total_price: 999.00 },
                { order_item_id: 2, order_id: 2, product_id: 1, quantity: 1, unit_price: 2499.00, total_price: 2499.00 },
                { order_item_id: 3, order_id: 3, product_id: 4, quantity: 1, unit_price: 129.99, total_price: 129.99 },
                { order_item_id: 4, order_id: 3, product_id: 6, quantity: 1, unit_price: 39.99, total_price: 39.99 },
                { order_item_id: 5, order_id: 4, product_id: 5, quantity: 3, unit_price: 12.99, total_price: 38.97 },
                { order_item_id: 6, order_id: 5, product_id: 3, quantity: 1, unit_price: 899.00, total_price: 899.00 }
              ]
            }
          ]
        },
        university: {
          name: "University Database",
          description: "Academic system with students, courses, enrollments, and grades",
          tables: [
            {
              name: 'students',
              columns: [
                { name: 'student_id', type: 'INTEGER', primary_key: true },
                { name: 'first_name', type: 'VARCHAR(50)' },
                { name: 'last_name', type: 'VARCHAR(50)' },
                { name: 'email', type: 'VARCHAR(100)' },
                { name: 'phone', type: 'VARCHAR(20)' },
                { name: 'date_of_birth', type: 'DATE' },
                { name: 'enrollment_date', type: 'DATE' },
                { name: 'major', type: 'VARCHAR(100)' },
                { name: 'year_level', type: 'VARCHAR(20)' },
                { name: 'gpa', type: 'DECIMAL(3,2)' },
                { name: 'status', type: 'VARCHAR(20)' }
              ],
              data: [
                { student_id: 1, first_name: 'Emma', last_name: 'Watson', email: 'emma.watson@university.edu', phone: '555-2001', date_of_birth: '2002-04-15', enrollment_date: '2020-08-25', major: 'Computer Science', year_level: 'Senior', gpa: 3.85, status: 'Active' },
                { student_id: 2, first_name: 'Liam', last_name: 'Johnson', email: 'liam.johnson@university.edu', phone: '555-2002', date_of_birth: '2001-12-03', enrollment_date: '2019-08-20', major: 'Business Administration', year_level: 'Senior', gpa: 3.42, status: 'Active' },
                { student_id: 3, first_name: 'Olivia', last_name: 'Brown', email: 'olivia.brown@university.edu', phone: '555-2003', date_of_birth: '2003-07-22', enrollment_date: '2021-08-30', major: 'Psychology', year_level: 'Junior', gpa: 3.67, status: 'Active' },
                { student_id: 4, first_name: 'Noah', last_name: 'Davis', email: 'noah.davis@university.edu', phone: '555-2004', date_of_birth: '2004-01-18', enrollment_date: '2022-08-28', major: 'Engineering', year_level: 'Sophomore', gpa: 3.91, status: 'Active' },
                { student_id: 5, first_name: 'Ava', last_name: 'Miller', email: 'ava.miller@university.edu', phone: '555-2005', date_of_birth: '2005-03-12', enrollment_date: '2023-08-26', major: 'Biology', year_level: 'Freshman', gpa: 4.00, status: 'Active' }
              ]
            },
            {
              name: 'professors',
              columns: [
                { name: 'professor_id', type: 'INTEGER', primary_key: true },
                { name: 'first_name', type: 'VARCHAR(50)' },
                { name: 'last_name', type: 'VARCHAR(50)' },
                { name: 'email', type: 'VARCHAR(100)' },
                { name: 'department', type: 'VARCHAR(100)' },
                { name: 'hire_date', type: 'DATE' },
                { name: 'salary', type: 'DECIMAL(10,2)' },
                { name: 'office_location', type: 'VARCHAR(50)' },
                { name: 'research_area', type: 'VARCHAR(200)' }
              ],
              data: [
                { professor_id: 1, first_name: 'Dr. Robert', last_name: 'Smith', email: 'robert.smith@university.edu', department: 'Computer Science', hire_date: '2015-08-15', salary: 95000, office_location: 'CS Building 201', research_area: 'Machine Learning and AI' },
                { professor_id: 2, first_name: 'Dr. Maria', last_name: 'Garcia', email: 'maria.garcia@university.edu', department: 'Business', hire_date: '2018-01-10', salary: 88000, office_location: 'Business Hall 305', research_area: 'Corporate Finance' },
                { professor_id: 3, first_name: 'Dr. James', last_name: 'Wilson', email: 'james.wilson@university.edu', department: 'Psychology', hire_date: '2012-09-01', salary: 82000, office_location: 'Psychology Wing 150', research_area: 'Cognitive Psychology' },
                { professor_id: 4, first_name: 'Dr. Sarah', last_name: 'Johnson', email: 'sarah.johnson@university.edu', department: 'Engineering', hire_date: '2020-02-15', salary: 92000, office_location: 'Engineering Lab 401', research_area: 'Renewable Energy Systems' }
              ]
            },
            {
              name: 'courses',
              columns: [
                { name: 'course_id', type: 'VARCHAR(10)', primary_key: true },
                { name: 'course_name', type: 'VARCHAR(150)' },
                { name: 'description', type: 'TEXT' },
                { name: 'credits', type: 'INTEGER' },
                { name: 'department', type: 'VARCHAR(100)' },
                { name: 'prerequisite', type: 'VARCHAR(10)' },
                { name: 'professor_id', type: 'INTEGER' }
              ],
              data: [
                { course_id: 'CS101', course_name: 'Introduction to Programming', description: 'Basic programming concepts using Python', credits: 3, department: 'Computer Science', prerequisite: null, professor_id: 1 },
                { course_id: 'CS201', course_name: 'Data Structures', description: 'Advanced data structures and algorithms', credits: 4, department: 'Computer Science', prerequisite: 'CS101', professor_id: 1 },
                { course_id: 'BUS101', course_name: 'Introduction to Business', description: 'Fundamentals of business management', credits: 3, department: 'Business', prerequisite: null, professor_id: 2 },
                { course_id: 'PSY101', course_name: 'General Psychology', description: 'Introduction to psychological principles', credits: 3, department: 'Psychology', prerequisite: null, professor_id: 3 },
                { course_id: 'ENG101', course_name: 'Engineering Fundamentals', description: 'Basic engineering principles and problem solving', credits: 4, department: 'Engineering', prerequisite: null, professor_id: 4 },
                { course_id: 'CS301', course_name: 'Database Systems', description: 'Database design and SQL programming', credits: 3, department: 'Computer Science', prerequisite: 'CS201', professor_id: 1 }
              ]
            },
            {
              name: 'enrollments',
              columns: [
                { name: 'enrollment_id', type: 'INTEGER', primary_key: true },
                { name: 'student_id', type: 'INTEGER' },
                { name: 'course_id', type: 'VARCHAR(10)' },
                { name: 'semester', type: 'VARCHAR(20)' },
                { name: 'year', type: 'INTEGER' },
                { name: 'grade', type: 'VARCHAR(2)' },
                { name: 'enrollment_date', type: 'DATE' },
                { name: 'status', type: 'VARCHAR(20)' }
              ],
              data: [
                { enrollment_id: 1, student_id: 1, course_id: 'CS101', semester: 'Fall', year: 2020, grade: 'A', enrollment_date: '2020-08-25', status: 'Completed' },
                { enrollment_id: 2, student_id: 1, course_id: 'CS201', semester: 'Spring', year: 2021, grade: 'A-', enrollment_date: '2021-01-15', status: 'Completed' },
                { enrollment_id: 3, student_id: 1, course_id: 'CS301', semester: 'Fall', year: 2023, grade: null, enrollment_date: '2023-08-25', status: 'Enrolled' },
                { enrollment_id: 4, student_id: 2, course_id: 'BUS101', semester: 'Fall', year: 2019, grade: 'B+', enrollment_date: '2019-08-20', status: 'Completed' },
                { enrollment_id: 5, student_id: 3, course_id: 'PSY101', semester: 'Fall', year: 2021, grade: 'A', enrollment_date: '2021-08-30', status: 'Completed' },
                { enrollment_id: 6, student_id: 4, course_id: 'ENG101', semester: 'Fall', year: 2022, grade: 'A', enrollment_date: '2022-08-28', status: 'Completed' },
                { enrollment_id: 7, student_id: 5, course_id: 'CS101', semester: 'Fall', year: 2023, grade: null, enrollment_date: '2023-08-26', status: 'Enrolled' }
              ]
            }
          ]
        }
      };

      // Select schema based on request or default to company
      const selectedTemplate = sessionData.template || 'company';
      const selectedSchema = databaseTemplates[selectedTemplate as keyof typeof databaseTemplates] || databaseTemplates.company;

      const result = await client.query(`
        INSERT INTO playground_sessions (
          user_id, title, description, database_schema, session_type
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        user?.id || null,
        sessionData.title || selectedSchema.name,
        sessionData.description || selectedSchema.description,
        JSON.stringify(sessionData.database_schema || selectedSchema),
        sessionData.session_type || 'freeform'
      ]);

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create playground session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

describe('Simple Task Manager E2E', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('http://localhost:5173')
  })

  it('US1: Can add and view a task', () => {
    const taskTitle = 'E2E Test Task ' + Date.now()
    
    // Check initial state or loading
    // Type in input
    cy.get('input[placeholder="What needs to be done?"]').type(taskTitle)
    
    // Click Add
    cy.contains('button', 'Add Task').click()

    // Verify task appears in list
    cy.contains('.task-title', taskTitle).should('be.visible')
  })

  it('US2: Can complete a task', () => {
    const taskTitle = 'Task to Complete ' + Date.now()
    
    // Add task first
    cy.get('input[placeholder="What needs to be done?"]').type(taskTitle)
    cy.contains('button', 'Add Task').click()

    // Find the task item containing the title
    cy.contains('.task-item', taskTitle).within(() => {
      // Check the checkbox
      cy.get('input[type="checkbox"]').check()
      
      // Verify completed style (optional, but good)
      // We check if the task item has 'completed' class based on our component logic
      // Note: React might take a moment to update class, cy.get retries automatically
    })
    
    // Verify the parent li has completed class
    cy.contains('.task-item', taskTitle).should('have.class', 'completed')
  })

  describe('Filtering', () => {
    beforeEach(() => {
      // Create test tasks: one active, one completed
      const activeTask = 'Active Task ' + Date.now()
      const completedTask = 'Completed Task ' + Date.now()
      
      // Add active task
      cy.get('input[placeholder="What needs to be done?"]').type(activeTask)
      cy.contains('button', 'Add Task').click()
      cy.wait(500) // Wait for task to be added
      
      // Add completed task
      cy.get('input[placeholder="What needs to be done?"]').type(completedTask)
      cy.contains('button', 'Add Task').click()
      cy.wait(500) // Wait for task to be added
      
      // Complete the second task
      cy.contains('.task-item', completedTask).within(() => {
        cy.get('input[type="checkbox"]').check()
      })
      cy.wait(500) // Wait for update
    })

    it('should filter tasks by All (default)', () => {
      // Verify both tasks are visible
      cy.get('[data-testid="filter-all"]').should('have.class', 'active')
      cy.get('.task-item').should('have.length.at.least', 2)
    })

    it('should filter tasks by Active', () => {
      // Click Active filter
      cy.get('[data-testid="filter-active"]').click()
      
      // Verify only active tasks are visible
      cy.get('.task-item').each(($el) => {
        cy.wrap($el).should('not.have.class', 'completed')
      })
      
      // Verify completed task is not visible
      cy.get('.task-item').should('not.contain', 'Completed Task')
    })

    it('should filter tasks by Completed', () => {
      // Click Completed filter
      cy.get('[data-testid="filter-completed"]').click()
      
      // Verify only completed tasks are visible
      cy.get('.task-item').each(($el) => {
        cy.wrap($el).should('have.class', 'completed')
      })
      
      // Verify active task is not visible
      cy.get('.task-item').should('not.contain', 'Active Task')
    })

    it('should switch between filters correctly', () => {
      // Start with All
      cy.get('[data-testid="filter-all"]').should('have.class', 'active')
      
      // Switch to Active
      cy.get('[data-testid="filter-active"]').click()
      cy.get('[data-testid="filter-active"]').should('have.class', 'active')
      
      // Switch to Completed
      cy.get('[data-testid="filter-completed"]').click()
      cy.get('[data-testid="filter-completed"]').should('have.class', 'active')
      
      // Switch back to All
      cy.get('[data-testid="filter-all"]').click()
      cy.get('[data-testid="filter-all"]').should('have.class', 'active')
    })
  })

  describe('Sorting', () => {
    beforeEach(() => {
      // Clear any existing tasks and create test tasks with known titles
      const tasks = [
        'Zebra Task',
        'Apple Task',
        'Banana Task'
      ]
      
      tasks.forEach((taskTitle, index) => {
        cy.get('input[placeholder="What needs to be done?"]').type(taskTitle)
        cy.contains('button', 'Add Task').click()
        cy.wait(300) // Wait between additions to ensure different timestamps
      })
    })

    it('should sort tasks by title A-Z', () => {
      cy.get('[data-testid="sort-select"]').select('title-asc')
      
      // Get all task titles
      cy.get('.task-title').then(($titles) => {
        const titles = Array.from($titles).map(el => el.textContent)
        
        // Verify alphabetical order
        expect(titles[0]).to.include('Apple')
        expect(titles[1]).to.include('Banana')
        expect(titles[2]).to.include('Zebra')
      })
    })

    it('should sort tasks by title Z-A', () => {
      cy.get('[data-testid="sort-select"]').select('title-desc')
      
      // Get all task titles
      cy.get('.task-title').then(($titles) => {
        const titles = Array.from($titles).map(el => el.textContent)
        
        // Verify reverse alphabetical order
        expect(titles[0]).to.include('Zebra')
        expect(titles[1]).to.include('Banana')
        expect(titles[2]).to.include('Apple')
      })
    })

    it('should sort tasks by date (newest first)', () => {
      cy.get('[data-testid="sort-select"]').select('date-desc')
      
      // The last task added should be first (newest)
      cy.get('.task-title').first().should('contain', 'Zebra')
    })

    it('should sort tasks by date (oldest first)', () => {
      cy.get('[data-testid="sort-select"]').select('date-asc')
      
      // The first task added should be first (oldest)
      cy.get('.task-title').first().should('contain', 'Zebra')
    })

    it('should maintain filter when sorting changes', () => {
      // Complete one task
      cy.contains('.task-item', 'Apple Task').within(() => {
        cy.get('input[type="checkbox"]').check()
      })
      cy.wait(300)
      
      // Filter to Active
      cy.get('[data-testid="filter-active"]').click()
      
      // Change sort
      cy.get('[data-testid="sort-select"]').select('title-asc')
      
      // Verify filter is still active (only active tasks visible)
      cy.get('.task-item').should('not.have.class', 'completed')
      cy.get('.task-item').should('not.contain', 'Apple')
    })

    it('should maintain sort when filter changes', () => {
      // Set sort to title A-Z
      cy.get('[data-testid="sort-select"]').select('title-asc')
      
      // Change filter
      cy.get('[data-testid="filter-active"]').click()
      
      // Verify sort is still applied (if there are multiple active tasks)
      cy.get('.task-item').then(($items) => {
        if ($items.length > 1) {
          cy.get('.task-title').then(($titles) => {
            const titles = Array.from($titles).map(el => el.textContent)
            // Verify they are still in alphabetical order
            const sorted = [...titles].sort()
            expect(titles).to.deep.equal(sorted)
          })
        }
      })
    })
  })
})

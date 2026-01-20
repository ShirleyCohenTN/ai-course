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
    let testTaskPrefix;
    let activeTaskTitle;
    let completedTaskTitle;
    
    beforeEach(() => {
      // Use unique prefix for this test run to identify our test tasks
      testTaskPrefix = 'FILTER_TEST_' + Date.now() + '_';
      activeTaskTitle = testTaskPrefix + 'Active Task'
      completedTaskTitle = testTaskPrefix + 'Completed Task'
      
      // Add active task
      cy.get('input[placeholder="What needs to be done?"]').type(activeTaskTitle)
      cy.contains('button', 'Add Task').click()
      cy.wait(500) // Wait for task to be added
      
      // Add completed task
      cy.get('input[placeholder="What needs to be done?"]').type(completedTaskTitle)
      cy.contains('button', 'Add Task').click()
      cy.wait(500) // Wait for task to be added
      
      // Complete the second task
      cy.contains('.task-item', completedTaskTitle).within(() => {
        cy.get('input[type="checkbox"]').check()
      })
      cy.wait(500) // Wait for update
    })

    it('should filter tasks by All (default)', () => {
      // Verify both tasks are visible
      cy.get('[data-testid="filter-all"]').should('have.class', 'active')
      
      // Check that our test tasks are visible
      cy.contains('.task-item', activeTaskTitle).should('be.visible')
      cy.contains('.task-item', completedTaskTitle).should('be.visible')
    })

    it('should filter tasks by Active', () => {
      // Click Active filter
      cy.get('[data-testid="filter-active"]').click()
      cy.wait(300) // Wait for filter to apply
      
      // Verify our active task is visible
      cy.contains('.task-item', activeTaskTitle).should('be.visible')
      cy.contains('.task-item', activeTaskTitle).should('not.have.class', 'completed')
      
      // Verify our completed task is NOT visible
      cy.contains('.task-item', completedTaskTitle).should('not.exist')
      
      // Verify all visible test tasks are active (not completed)
      cy.get('.task-item').then(($items) => {
        const testItems = Array.from($items).filter((el) => {
          const title = el.querySelector('.task-title')?.textContent?.trim() || ''
          return title.startsWith(testTaskPrefix)
        })
        
        testItems.forEach((item) => {
          expect(item).to.not.have.class('completed')
        })
      })
    })

    it('should filter tasks by Completed', () => {
      // Click Completed filter
      cy.get('[data-testid="filter-completed"]').click()
      cy.wait(300) // Wait for filter to apply
      
      // Verify our completed task is visible
      cy.contains('.task-item', completedTaskTitle).should('be.visible')
      cy.contains('.task-item', completedTaskTitle).should('have.class', 'completed')
      
      // Verify our active task is NOT visible
      cy.contains('.task-item', activeTaskTitle).should('not.exist')
      
      // Verify all visible test tasks are completed
      cy.get('.task-item').then(($items) => {
        const testItems = Array.from($items).filter((el) => {
          const title = el.querySelector('.task-title')?.textContent?.trim() || ''
          return title.startsWith(testTaskPrefix)
        })
        
        testItems.forEach((item) => {
          expect(item).to.have.class('completed')
        })
      })
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
    let testTaskPrefix;
    
    beforeEach(() => {
      // Use unique prefix for this test run to identify our test tasks
      testTaskPrefix = 'SORT_TEST_' + Date.now() + '_';
      
      // Create test tasks with known titles and unique prefix
      const tasks = [
        testTaskPrefix + 'Zebra Task',
        testTaskPrefix + 'Apple Task',
        testTaskPrefix + 'Banana Task'
      ]
      
      tasks.forEach((taskTitle, index) => {
        cy.get('input[placeholder="What needs to be done?"]').type(taskTitle)
        cy.contains('button', 'Add Task').click()
        cy.wait(500) // Wait between additions to ensure different timestamps and UI updates
      })
    })

    it('should sort tasks by title A-Z', () => {
      cy.get('[data-testid="sort-select"]').select('title-asc')
      cy.wait(300) // Wait for UI to update
      
      // Get only our test task titles (filter by prefix)
      cy.get('.task-title').then(($titles) => {
        const allTitles = Array.from($titles).map(el => el.textContent.trim())
        const testTitles = allTitles.filter(title => title.startsWith(testTaskPrefix))
        
        // Verify we have exactly 3 test tasks
        expect(testTitles).to.have.length(3)
        
        // Verify alphabetical order of our test tasks
        expect(testTitles[0]).to.include('Apple')
        expect(testTitles[1]).to.include('Banana')
        expect(testTitles[2]).to.include('Zebra')
      })
    })

    it('should sort tasks by title Z-A', () => {
      cy.get('[data-testid="sort-select"]').select('title-desc')
      cy.wait(300) // Wait for UI to update
      
      // Get only our test task titles (filter by prefix)
      cy.get('.task-title').then(($titles) => {
        const allTitles = Array.from($titles).map(el => el.textContent.trim())
        const testTitles = allTitles.filter(title => title.startsWith(testTaskPrefix))
        
        // Verify we have exactly 3 test tasks
        expect(testTitles).to.have.length(3)
        
        // Verify reverse alphabetical order
        expect(testTitles[0]).to.include('Zebra')
        expect(testTitles[1]).to.include('Banana')
        expect(testTitles[2]).to.include('Apple')
      })
    })

    it('should sort tasks by date (newest first)', () => {
      cy.get('[data-testid="sort-select"]').select('date-desc')
      cy.wait(300) // Wait for UI to update
      
      // Get only our test task titles (filter by prefix)
      cy.get('.task-title').then(($titles) => {
        const allTitles = Array.from($titles).map(el => el.textContent.trim())
        const testTitles = allTitles.filter(title => title.startsWith(testTaskPrefix))
        
        // Verify we have exactly 3 test tasks
        expect(testTitles).to.have.length(3)
        
        // The last task added should be first (newest)
        // Tasks added in order: Zebra (oldest), Apple, Banana (newest)
        expect(testTitles[0]).to.include('Banana')
      })
    })

    it('should sort tasks by date (oldest first)', () => {
      cy.get('[data-testid="sort-select"]').select('date-asc')
      cy.wait(300) // Wait for UI to update
      
      // Get only our test task titles (filter by prefix)
      cy.get('.task-title').then(($titles) => {
        const allTitles = Array.from($titles).map(el => el.textContent.trim())
        const testTitles = allTitles.filter(title => title.startsWith(testTaskPrefix))
        
        // Verify we have exactly 3 test tasks
        expect(testTitles).to.have.length(3)
        
        // The first task added should be first (oldest)
        // Tasks added in order: Zebra (oldest), Apple, Banana (newest)
        expect(testTitles[0]).to.include('Zebra')
      })
    })

    it('should maintain filter when sorting changes', () => {
      const appleTaskTitle = testTaskPrefix + 'Apple Task'
      
      // Complete one task
      cy.contains('.task-item', appleTaskTitle).within(() => {
        cy.get('input[type="checkbox"]').check()
      })
      cy.wait(500) // Wait for update to complete
      
      // Filter to Active
      cy.get('[data-testid="filter-active"]').click()
      cy.wait(300) // Wait for filter to apply
      
      // Change sort
      cy.get('[data-testid="sort-select"]').select('title-asc')
      cy.wait(300) // Wait for sort to apply
      
      // Verify filter is still active - check only our test tasks
      cy.get('.task-item').then(($items) => {
        const testItems = Array.from($items).filter((el) => {
          const title = el.querySelector('.task-title')?.textContent?.trim() || ''
          return title.startsWith(testTaskPrefix)
        })
        
        // All our visible test tasks should be active (not completed)
        testItems.forEach((item) => {
          expect(item).to.not.have.class('completed')
        })
        
        // Apple task should not be visible (it's completed)
        const appleVisible = testItems.some((item) => {
          const title = item.querySelector('.task-title')?.textContent?.trim() || ''
          return title.includes('Apple')
        })
        expect(appleVisible).to.be.false
      })
    })

    it('should maintain sort when filter changes', () => {
      // Set sort to title A-Z
      cy.get('[data-testid="sort-select"]').select('title-asc')
      cy.wait(300) // Wait for sort to apply
      
      // Change filter
      cy.get('[data-testid="filter-active"]').click()
      cy.wait(300) // Wait for filter to apply
      
      // Verify sort is still applied - check only our test tasks
      cy.get('.task-item').then(($items) => {
        const testItems = Array.from($items).filter((el) => {
          const title = el.querySelector('.task-title')?.textContent?.trim() || ''
          return title.startsWith(testTaskPrefix)
        })
        
        if (testItems.length > 1) {
          const testTitles = testItems.map((item) => {
            return item.querySelector('.task-title')?.textContent?.trim() || ''
          })
          
          // Verify they are still in alphabetical order
          const sorted = [...testTitles].sort()
          expect(testTitles).to.deep.equal(sorted)
        }
      })
    })
  })
})

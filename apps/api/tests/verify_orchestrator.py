import asyncio
import sys
import os

# Add apps/api to path
base_dir = os.path.join(os.path.dirname(__file__), "../")
sys.path.insert(0, base_dir)

from orchestrator import Orchestrator

async def test_orchestrator():
    orchestrator = Orchestrator()
    
    print("--- Testing 'Fix login bug' task ---")
    result = await orchestrator.run_complex_task("Fix login bug", repo_id=1)
    
    if result["success"]:
        print("\nSuccess!")
        print(f"Final Response Length: {len(result['final_response'])}")
        print("\nExecution Log:")
        for step in result["execution_log"]:
            print(f"- {step['agent']}: {step['status']}")
    else:
        print(f"\nFailed: {result.get('error')}")

    print("\n--- Testing 'Update README' task ---")
    result = await orchestrator.run_complex_task("Update README for the new API", repo_id=1)
    
    if result["success"]:
        print("\nSuccess!")
        print("\nExecution Log:")
        for step in result["execution_log"]:
            print(f"- {step['agent']}: {step['status']}")
    else:
        print(f"\nFailed: {result.get('error')}")

if __name__ == "__main__":
    asyncio.run(test_orchestrator())

# packages/ai-agents/tools/repo_search.py

class RepoSearchTool:
    """Tool to search code using Phase 3 embeddings"""
    
    def __init__(self, search_service_factory):
        """
        Takes a factory or instance that provides search logic.
        In this context, it will likely be injected from the FastAPI app.
        """
        self.search_service_factory = search_service_factory

    async def run(self, repo_id: int, query: str, limit: int = 5) -> str:
        """Search the repository for relevant code chunks"""
        try:
            # Assuming search_service is passed in or created via factory
            search_service = self.search_service_factory()
            result = await search_service.search_repository(repo_id, query, limit=limit)
            
            if not result or not result.get("results"):
                return "No relevant code found for this query."
            
            formatted_results = []
            for i, res in enumerate(result["results"]):
                formatted_results.append(
                    f"Result {i+1} (Path: {res['file_path']}, Similarity: {res['similarity']:.2f}):\n"
                    f"```\n{res['content']}\n```"
                )
            
            return "\n\n".join(formatted_results)
        except Exception as e:
            return f"Error searching repository: {str(e)}"

// DecisionTraces Component - Placeholder for Shard 4
// This will be fully implemented in the Decision Traces shard

interface Props {
  recommendationId: string;
}

export function DecisionTraces({ recommendationId }: Props) {
  return (
    <div className="text-center py-8 text-gray-500">
      <p className="text-sm">Decision traces will be implemented in Shard 4</p>
      <p className="text-xs text-gray-400 mt-1">
        Recommendation ID: {recommendationId}
      </p>
    </div>
  );
}

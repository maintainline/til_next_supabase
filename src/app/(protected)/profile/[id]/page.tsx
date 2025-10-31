interface ProfileDetailProps {
  params: {
    id: string;
  };
}

function ProfileDetail({ params }: ProfileDetailProps) {
  const { id } = params;
  return <div>{id} ProfileDetail</div>;
}

export default ProfileDetail;

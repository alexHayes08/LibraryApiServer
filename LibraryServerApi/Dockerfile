FROM microsoft/dotnet:2.1-aspnetcore-runtime AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM microsoft/dotnet:2.1-sdk AS build
WORKDIR /src
COPY ["LibraryServerApi/LibraryServerApi.csproj", "LibraryServerApi/"]
RUN dotnet restore "LibraryServerApi/LibraryServerApi.csproj"
COPY . .
WORKDIR "/src/LibraryServerApi"
RUN dotnet build "LibraryServerApi.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "LibraryServerApi.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "LibraryServerApi.dll"]
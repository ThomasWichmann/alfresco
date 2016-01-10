# Extended user import

Created from standard Alfresco repository AMP archetype `mvn archetype:generate -DgroupId=de.alphazentauri -DartifactId=extended-user-import -Dversion=1.0-SNAPSHOT  -Dfilter=org.alfresco:`

See webscript description for details src/main/amp/config/alfresco/extension/templates/webscripts/extended-user-import.post.desc.xml 

## Example call

curl -F "file=<./src/test/resources/example-users.csv" -F isDryRun=true  "http://admin:admin@localhost:8080/alfresco/service/extended-user-import"

Checks imported user result:
http://localhost:8080/alfresco/service/api/people
Check existing groups:
http://localhost:8080/alfresco/service/api/groups
Check existing sites:
http://localhost:8080/alfresco/service/api/sites

## Building

Run Alfresco locally with AMP loaded:
mvn install -Pamp-to-war

Rapid webscript reloading locally for testing:
mvn compile alfresco:refresh-repo
